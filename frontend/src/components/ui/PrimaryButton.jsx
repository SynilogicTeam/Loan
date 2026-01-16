export default function PrimaryButton({ children, onClick, danger }) {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md text-sm font-medium
        ${danger
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {children}
      </button>
    );
  }
  