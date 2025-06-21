import { ProjectCard } from "../types/project";

/**
 * Processes dashboard card order data with order_key format
 * Migration from order_index is complete, only handles order_key format now
 */
export function migrateDashboardCardOrder(
  rawCardOrder: unknown,
  defaultCards: ProjectCard[],
): ProjectCard[] {
  if (!rawCardOrder) {
    return defaultCards;
  }

  try {
    let cards: unknown[];

    // Handle both array and string formats
    if (Array.isArray(rawCardOrder)) {
      cards = rawCardOrder;
    } else if (typeof rawCardOrder === "string") {
      cards = JSON.parse(rawCardOrder) as unknown[];
    } else {
      // Try to treat as an array-like object
      cards = [rawCardOrder];
    }

    // Expect all cards to have order_key (migration is complete)
    const validCards = cards.filter(
      (card): card is Record<string, unknown> =>
        typeof card === "object" &&
        card !== null &&
        typeof (card as Record<string, unknown>).order_key === "string",
    );

    return validCards.map((card) => ({
      id: String(card.id || ""),
      type: (card.type as ProjectCard["type"]) || "updates",
      title: String(card.title || ""),
      order_key: String(card.order_key),
    })) as ProjectCard[];
  } catch (error) {
    console.warn(
      "Failed to migrate dashboard card order, using default:",
      error,
    );
    return defaultCards;
  }
}

/**
 * Saves dashboard card order to database, ensuring order_key format
 */
export async function saveDashboardCardOrder(
  cards: ProjectCard[],
  projectId: string,
  supabase: unknown,
): Promise<boolean> {
  try {
    // Ensure all cards have order_key
    const normalizedCards = cards.map((card) => ({
      id: card.id,
      type: card.type,
      title: card.title,
      order_key: card.order_key,
    }));

    const { error } = await (
      supabase as {
        from: (table: string) => {
          update: (data: unknown) => {
            eq: (field: string, value: string) => Promise<{ error?: Error }>;
          };
        };
      }
    )
      .from("projects")
      .update({ dashboard_card_order: normalizedCards })
      .eq("id", projectId);

    if (error) {
      console.warn("Failed to save dashboard order to database:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Failed to save dashboard order to database:", error);
    return false;
  }
}
