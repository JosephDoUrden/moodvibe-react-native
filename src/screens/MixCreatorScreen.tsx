import React from "react";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MixManager from "../components/MixManager";
import { RootStackParamList, SoundMix } from "../types";
import { soundMixService } from "../services/SoundMixService";

type MixCreatorRouteProp = RouteProp<RootStackParamList, "MixCreator">;
type MixCreatorNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MixCreator"
>;

const MixCreatorScreen: React.FC = () => {
  const route = useRoute<MixCreatorRouteProp>();
  const navigation = useNavigation<MixCreatorNavigationProp>();

  const { moodId, mixId } = route.params || {};

  // Load existing mix if editing
  const initialMix = mixId ? soundMixService.getMixById(mixId) : undefined;

  const handleSave = (mix: SoundMix) => {
    console.log("Mix saved:", mix);
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <MixManager
      initialMix={initialMix}
      moodId={moodId}
      onSave={handleSave}
      onCancel={handleCancel}
      isPreviewMode={false}
    />
  );
};

export default MixCreatorScreen;
