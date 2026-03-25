import { cssInterop } from "nativewind";
import { MotiView } from "moti";
import { FlashList } from "@shopify/flash-list";
import * as LucideIcons from "lucide-react-native";

// Register MotiView to support className (maps to style)
cssInterop(MotiView, {
  className: {
    target: "style",
  },
});

// Register FlashList to support className (maps to style or contentContainerStyle depending on use)
// Usually we use it for style
cssInterop(FlashList, {
  className: {
    target: "style",
  },
});

// Register all Lucide Icons to support className
Object.keys(LucideIcons).forEach((iconName) => {
  const Icon = LucideIcons[iconName];
  if (Icon && typeof Icon === 'function' || (typeof Icon === 'object' && Icon.$$typeof)) {
    cssInterop(Icon, {
      className: {
        target: "style",
      },
    });
  }
});
