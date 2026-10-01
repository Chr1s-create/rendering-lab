import type { Lesson } from "../types";
import { actions } from "./classic/actions";
import { caching } from "./classic/caching";
import { csr } from "./classic/csr";
import { hydration } from "./classic/hydration";
import { isr } from "./classic/isr";
import { pagesRouter } from "./classic/pages-router";
import { runtime } from "./classic/runtime";
import { serverClient } from "./classic/server-client";
import { ssg } from "./classic/ssg";
import { ssr } from "./classic/ssr";
import { streaming } from "./classic/streaming";
import { cacheLife } from "./modern/cache-life";
import { cacheTagLesson } from "./modern/cache-tag";
import { migration } from "./modern/migration";
import { ppr } from "./modern/ppr";
import { runtimeData } from "./modern/runtime-data";
import { useCache } from "./modern/use-cache";

export {
  actions,
  cacheLife,
  cacheTagLesson,
  caching,
  csr,
  hydration,
  isr,
  migration,
  pagesRouter,
  ppr,
  runtime,
  runtimeData,
  serverClient,
  ssg,
  ssr,
  streaming,
  useCache,
};

export const classicLessons: Lesson[] = [
  ssg,
  ssr,
  isr,
  csr,
  serverClient,
  streaming,
  caching,
  actions,
  runtime,
  hydration,
  pagesRouter,
];

export const modernLessons: Lesson[] = [ppr, useCache, cacheLife, cacheTagLesson, runtimeData, migration];

export const allLessons: Lesson[] = [...classicLessons, ...modernLessons];
