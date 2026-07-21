const common = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-[18px] w-[18px] flex-shrink-0",
};

export function Icon({ name }: { name: string }) {
  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
          <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
          <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
          <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
        </svg>
      );
    case "transactions":
      return (
        <svg {...common}>
          <path d="M6 4v13" />
          <path d="M6 17l-3.5-3.5" />
          <path d="M6 17l3.5-3.5" />
          <path d="M18 20V7" />
          <path d="M18 7l3.5 3.5" />
          <path d="M18 7l-3.5 3.5" />
        </svg>
      );
    case "facturation":
      return (
        <svg {...common}>
          <rect x="5" y="2.5" width="14" height="19" rx="1.5" />
          <line x1="8" y1="7.5" x2="16" y2="7.5" />
          <line x1="8" y1="11.5" x2="16" y2="11.5" />
          <line x1="8" y1="15.5" x2="13" y2="15.5" />
        </svg>
      );
    case "tresorerie":
      return (
        <svg {...common}>
          <path d="M3 10.5L12 4l9 6.5" />
          <line x1="5" y1="10.5" x2="5" y2="19" />
          <line x1="10" y1="10.5" x2="10" y2="19" />
          <line x1="14" y1="10.5" x2="14" y2="19" />
          <line x1="19" y1="10.5" x2="19" y2="19" />
          <line x1="3" y1="19.5" x2="21" y2="19.5" />
        </svg>
      );
    case "rapports":
      return (
        <svg {...common}>
          <line x1="4" y1="20.5" x2="20" y2="20.5" />
          <rect x="6" y="11" width="3" height="9" />
          <rect x="11" y="6" width="3" height="14" />
          <rect x="16" y="14" width="3" height="6" />
        </svg>
      );
    case "parametres":
      return (
        <svg {...common}>
          <line x1="4" y1="6" x2="20" y2="6" />
          <circle cx="9" cy="6" r="2" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <circle cx="15" cy="12" r="2" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="11" cy="18" r="2" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    default:
      return null;
  }
}
