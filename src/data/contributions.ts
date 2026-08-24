export type Contribution = {
  name: string;
  owner: string;
  repo: string;
  homepage?: string;
  /** The project's own description, taken from its repository. */
  summary: string;
  language: string;
};

export const contributions: Contribution[] = [
  {
    name: "OmniTerm",
    owner: "hainguyenh",
    repo: "https://github.com/hainguyenh/OmniTerm",
    summary: "An offline, multi-window SSH/RDP/local terminal and connection manager.",
    language: "TypeScript",
  },
  {
    name: "OpenLogi",
    owner: "AprilNEA",
    repo: "https://github.com/AprilNEA/OpenLogi",
    homepage: "https://openlogi.org",
    summary:
      "A native, local-first alternative to Logitech Options+, written in Rust: remap buttons, DPI, and SmartShift over HID++.",
    language: "Rust",
  },
];
