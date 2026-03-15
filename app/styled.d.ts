// styled.d.ts (in the root or next to your theme file)
import "styled-components/native";

declare module "styled-components/native" {
  export interface DefaultTheme {
    borderRadius: string;
    palette: {
      primary: {
        main: string;
        contrastText: string;
      };
      secondary: {
        main: string;
        contrastText: string;
      };
      tertiary: {
        main: string;
        contrastText: string;
      };
      accent: string;
      transparent: string;
      black: string;
      white: string;
      text: string;
      backgroundColor: string;
      lightGray: string;
      gray: string;
      darkGray: string;
      IP_Clickable_bg: string;
      IP_Swipe_bg: string;
      IP_TextInput_bg: string;
      IP_Btn_bg: string;
      IP_Label_bg: string;
      AWE_Blue: string;
      AWE_Red: string;
      AWE_Yellow: string;
      AWE_Green: string;
    };
  }
}
