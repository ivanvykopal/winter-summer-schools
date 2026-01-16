"use client";
import { createTheme, ThemeOptions } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#1e88e5",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#26a69a",
      light: "#4db6ac",
      dark: "#00897b",
    },
    background: {
      default: "#0a0a0a",
      paper: "#1a1a1a",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    divider: "#2a2a2a",
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: "0.5px",
    },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            backgroundColor: "#fff",
            borderRadius: 8,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
            },
            "&.Mui-focused": {
              boxShadow: "0 2px 12px rgba(30, 136, 229, 0.25)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#666",
            fontWeight: 500,
            "&.Mui-focused": {
              color: "#1e88e5",
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#e0e0e0",
          },
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1e88e5",
          },
          "& .MuiInputBase-input": {
            color: "#000",
            fontWeight: 500,
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#999",
            opacity: 1,
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          borderRadius: 8,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
          },
          "&.Mui-focused": {
            boxShadow: "0 2px 12px rgba(30, 136, 229, 0.25)",
          },
        },
        select: {
          color: "#000",
          fontWeight: 500,
          "&:focus": {
            backgroundColor: "#fff",
          },
        },
        icon: {
          color: "#666",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#666",
          fontWeight: 500,
          "&.Mui-focused": {
            color: "#1e88e5",
          },
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#fff",
          color: "#000",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          borderRadius: 8,
          marginTop: 4,
        },
        list: {
          padding: "4px",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#000",
          fontWeight: 500,
          borderRadius: 4,
          margin: "2px 0",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
          "&.Mui-selected": {
            backgroundColor: "#e3f2fd",
            color: "#1e88e5",
            "&:hover": {
              backgroundColor: "#bbdefb",
            },
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f5f5",
          border: "1px solid #e0e0e0",
          borderRadius: "6px !important",
          boxShadow: "none",
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            margin: "16px 0",
            backgroundColor: "#f5f5f5",
          },
          "&.Mui-expanded:first-of-type": {
            marginTop: 0,
          },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f5f5",
          minHeight: 40,
          "&:hover": {
            backgroundColor: "#eeeeee",
          },
          "&.Mui-expanded": {
            backgroundColor: "#f5f5f5",
            minHeight: 40,
          },
          "& .MuiAccordionSummary-content": {
            margin: "8px 0",
          },
          "& .MuiAccordionSummary-content.Mui-expanded": {
            margin: "8px 0",
          },
        },
      },
    },

    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          padding: "16px",
          borderTop: "1px solid #e0e0e0",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "8px 16px",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(30, 136, 229, 0.3)",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 12,
          border: "1px solid #2a2a2a",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
};

const darkTheme = createTheme(themeOptions);
export default darkTheme;
