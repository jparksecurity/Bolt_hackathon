export interface ProjectCard {
  id: string;
  type: "updates" | "availability" | "properties" | "roadmap" | "documents";
  title: string;
  order_index: number;
}
