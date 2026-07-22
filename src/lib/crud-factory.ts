// ============================================================================
// Admin CRUD Factory — generates typed list + create handlers.
// Reduces boilerplate across 12+ admin resource routes.
// ============================================================================

import type { NextRequest, NextResponse } from "next/server";
import { fail, isErrorResponse, ok, requireAdmin } from "@/lib/api";
import { logActivity } from "@/lib/log-activity";
import { getClientIp } from "@/lib/rate-limit";
import type { ZodSchema } from "zod";

/** Minimal Prisma-delegate shape — `args: any` is required because Prisma's delegate
 *  types are invariant in their args (e.g. `TestimonialFindUniqueArgs`) and cannot
 *  be satisfied by a generic `Record<string, unknown>` without breaking assignability
 *  of the real Prisma client delegates. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaListDelegate<T> = { findMany: (args?: any) => Promise<T[]> };

interface ListConfig<T> {
  model: PrismaListDelegate<T>;
  orderBy?: Record<string, "asc" | "desc">;
  include?: Record<string, unknown>;
  /** Transform each item before returning (e.g. parse JSON string fields to arrays). */
  transformResponse?: (item: T) => T;
}

/** Handler for GET (list all) — admin only. */
export function makeListHandler<T>({ model, orderBy = { createdAt: "desc" }, include, transformResponse }: ListConfig<T>) {
  return async function GET(_request: NextRequest): Promise<NextResponse> {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;

    const items = await model.findMany({ orderBy, ...(include ? { include } : {}) });
    const transformed = transformResponse ? items.map(transformResponse) : items;
    return ok(transformed);
  };
}

/** Minimal Prisma-delegate shape for create-only models. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaCreateDelegate<TEntity> = { create: (args: { data: any }) => Promise<TEntity> };

interface CreateConfig<TInput, TEntity> {
  model: PrismaCreateDelegate<TEntity>;
  schema: ZodSchema<TInput>;
  entityName: string;
  /** Transform validated input before create (e.g. stringify arrays). */
  transform?: (input: TInput) => Record<string, unknown>;
}

/** Handler for POST (create) — admin only, with validation. */
export function makeCreateHandler<TInput, TEntity>({
  model,
  schema,
  entityName,
  transform,
}: CreateConfig<TInput, TEntity>) {
  return async function POST(request: NextRequest): Promise<NextResponse> {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail("Invalid request body", 400);
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return fail(
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        422
      );
    }

    const data = transform ? transform(parsed.data) : (parsed.data as unknown as Record<string, unknown>);

    try {
      const created = await model.create({ data: data as TInput });
      await logActivity({
        action: `CREATE_${entityName.toUpperCase()}`,
        entity: entityName,
        entityId: (created as { id?: string }).id,
        ipAddress: getClientIp(request),
      });
      return ok(created, `${entityName} created successfully`, 201);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (msg.includes("Unique constraint")) {
        return fail("A record with this slug already exists.", 409);
      }
      return fail(`Failed to create ${entityName.toLowerCase()}: ${msg}`, 500);
    }
  };
}

// ----------------------------------------------------------------------------
// Single-record handlers (GET / PUT / DELETE by id)
// ----------------------------------------------------------------------------

/** Minimal Prisma-delegate shape for single-record (id-keyed) operations. */
type PrismaEntityDelegate<TEntity> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findUnique: (args: any) => Promise<TEntity | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (args: any) => Promise<TEntity>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: (args: any) => Promise<TEntity>;
};

interface EntityConfig<TEntity> {
  model: PrismaEntityDelegate<TEntity>;
  schema: ZodSchema<unknown>;
  entityName: string;
  transform?: (input: unknown) => Record<string, unknown>;
  transformResponse?: (item: TEntity) => TEntity;
  include?: Record<string, unknown>;
}

/** GET /api/admin/[resource]/[id] */
export function makeGetOneHandler<TEntity>({ model, include, transformResponse }: EntityConfig<TEntity>) {
  return async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;

    const { id } = await params;
    const item = await model.findUnique({ where: { id }, ...(include ? { include } : {}) });
    if (!item) return fail("Not found", 404);
    return ok(transformResponse ? transformResponse(item) : item);
  };
}

/** PUT /api/admin/[resource]/[id] */
export function makeUpdateHandler<TEntity>({ model, schema, entityName, transform, include }: EntityConfig<TEntity>) {
  return async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;

    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail("Invalid request body", 400);
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return fail(
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        422
      );
    }

    const data = transform ? transform(parsed.data) : (parsed.data as Record<string, unknown>);

    try {
      const updated = await model.update({
        where: { id },
        data,
        ...(include ? { include } : {}),
      });
      await logActivity({
        action: `UPDATE_${entityName.toUpperCase()}`,
        entity: entityName,
        entityId: id,
        ipAddress: getClientIp(request),
      });
      return ok(updated, `${entityName} updated successfully`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return fail(`Failed to update: ${msg}`, 500);
    }
  };
}

/** DELETE /api/admin/[resource]/[id] */
export function makeDeleteHandler<TEntity>({ model, entityName }: EntityConfig<TEntity>) {
  return async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;

    const { id } = await params;
    try {
      await model.delete({ where: { id } });
      await logActivity({
        action: `DELETE_${entityName.toUpperCase()}`,
        entity: entityName,
        entityId: id,
        ipAddress: getClientIp(request),
      });
      return ok({ id }, `${entityName} deleted successfully`);
    } catch {
      return fail(`${entityName} not found or could not be deleted`, 404);
    }
  };
}
