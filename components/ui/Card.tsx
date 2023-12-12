import { View, ViewStyle } from "react-native";

interface CardProps extends React.PropsWithChildren {
  style?: ViewStyle;
}

export default function Card({ children, style = {} }: CardProps) {
  return (
    <View
      style={{
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#f5f5f5",
        elevation: 6,
        shadowColor: "#333",
        shadowRadius: 6,
        shadowOffset: { height: 4, width: 0 },
        shadowOpacity: 0.2,
        ...style,
      }}
    >
      {children}
    </View>
  );
}
