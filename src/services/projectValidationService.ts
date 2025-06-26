import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

/**
 * Project validation result interface
 */
interface ProjectValidationResult {
  isValid: boolean;
  exists: boolean;
  hasAccess: boolean;
  error?: string;
}

/**
 * Service for validating project access and ownership
 * Ensures that project IDs referenced in AI suggestions are valid and accessible to the current user
 */
export class ProjectValidationService {
  private validProjectsCache = new Set<string>();
  private invalidProjectsCache = new Set<string>();
  private cacheTimestamp = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Validate if a project exists and is accessible to the current user
   */
  async validateProjectAccess(
    projectId: string,
  ): Promise<ProjectValidationResult> {
    if (!projectId || typeof projectId !== "string") {
      return {
        isValid: false,
        exists: false,
        hasAccess: false,
        error: "Invalid project ID format",
      };
    }

    // Check cache first
    const cacheResult = this.checkCache(projectId);
    if (cacheResult !== null) {
      return cacheResult;
    }

    try {
      // Query the project to check existence and ownership
      const { data: project, error } = await this.supabase
        .from("projects")
        .select("id, title, clerk_user_id")
        .eq("id", projectId)
        .maybeSingle();

      if (error) {
        console.error("Project validation query error:", {
          projectId,
          error: error.message,
          details: error.details,
          hint: error.hint,
        });

        const result: ProjectValidationResult = {
          isValid: false,
          exists: false,
          hasAccess: false,
          error: `Database error: ${error.message}`,
        };

        // Don't cache database errors
        return result;
      }

      if (!project) {
        const result: ProjectValidationResult = {
          isValid: false,
          exists: false,
          hasAccess: false,
          error: "Project not found",
        };

        this.cacheInvalidProject(projectId);
        return result;
      }

      // Project exists, so we have access (RLS would prevent the query if we didn't)
      const result: ProjectValidationResult = {
        isValid: true,
        exists: true,
        hasAccess: true,
      };

      this.cacheValidProject(projectId);
      return result;
    } catch (error) {
      console.error("Unexpected error in project validation:", error);

      return {
        isValid: false,
        exists: false,
        hasAccess: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected validation error",
      };
    }
  }

  /**
   * Batch validate multiple project IDs
   */
  async validateMultipleProjects(
    projectIds: string[],
  ): Promise<Map<string, ProjectValidationResult>> {
    const results = new Map<string, ProjectValidationResult>();

    // Process unique project IDs only
    const uniqueProjectIds = [...new Set(projectIds.filter(Boolean))];

    if (uniqueProjectIds.length === 0) {
      return results;
    }

    // Check cache for all IDs first
    const uncachedIds: string[] = [];
    for (const projectId of uniqueProjectIds) {
      const cacheResult = this.checkCache(projectId);
      if (cacheResult !== null) {
        results.set(projectId, cacheResult);
      } else {
        uncachedIds.push(projectId);
      }
    }

    // Batch query uncached project IDs
    if (uncachedIds.length > 0) {
      try {
        const { data: projects, error } = await this.supabase
          .from("projects")
          .select("id, title, clerk_user_id")
          .in("id", uncachedIds);

        if (error) {
          console.error("Batch project validation error:", {
            projectIds: uncachedIds,
            error: error.message,
            details: error.details,
            hint: error.hint,
          });

          // Mark all uncached IDs as invalid due to query error
          for (const projectId of uncachedIds) {
            results.set(projectId, {
              isValid: false,
              exists: false,
              hasAccess: false,
              error: `Database error: ${error.message}`,
            });
          }
        } else {
          const foundProjectIds = new Set(projects?.map((p) => p.id) || []);

          // Process each uncached ID
          for (const projectId of uncachedIds) {
            if (foundProjectIds.has(projectId)) {
              const result: ProjectValidationResult = {
                isValid: true,
                exists: true,
                hasAccess: true,
              };
              results.set(projectId, result);
              this.cacheValidProject(projectId);
            } else {
              const result: ProjectValidationResult = {
                isValid: false,
                exists: false,
                hasAccess: false,
                error: "Project not found",
              };
              results.set(projectId, result);
              this.cacheInvalidProject(projectId);
            }
          }
        }
      } catch (error) {
        console.error("Unexpected error in batch project validation:", error);

        // Mark all uncached IDs as invalid due to unexpected error
        for (const projectId of uncachedIds) {
          results.set(projectId, {
            isValid: false,
            exists: false,
            hasAccess: false,
            error:
              error instanceof Error
                ? error.message
                : "Unexpected validation error",
          });
        }
      }
    }

    return results;
  }

  /**
   * Clear the validation cache (useful for testing or when user permissions change)
   */
  clearCache(): void {
    this.validProjectsCache.clear();
    this.invalidProjectsCache.clear();
    this.cacheTimestamp = 0;
  }

  /**
   * Check if a project ID is in the cache and return the cached result if valid
   */
  private checkCache(projectId: string): ProjectValidationResult | null {
    const now = Date.now();

    // Clear cache if expired
    if (now - this.cacheTimestamp > this.CACHE_DURATION) {
      this.clearCache();
      return null;
    }

    if (this.validProjectsCache.has(projectId)) {
      return {
        isValid: true,
        exists: true,
        hasAccess: true,
      };
    }

    if (this.invalidProjectsCache.has(projectId)) {
      return {
        isValid: false,
        exists: false,
        hasAccess: false,
        error: "Project not found (cached)",
      };
    }

    return null;
  }

  /**
   * Cache a valid project ID
   */
  private cacheValidProject(projectId: string): void {
    this.validProjectsCache.add(projectId);
    this.invalidProjectsCache.delete(projectId);
    this.cacheTimestamp = Date.now();
  }

  /**
   * Cache an invalid project ID
   */
  private cacheInvalidProject(projectId: string): void {
    this.invalidProjectsCache.add(projectId);
    this.validProjectsCache.delete(projectId);
    this.cacheTimestamp = Date.now();
  }
}
