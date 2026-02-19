import { pgEnum } from "drizzle-orm/pg-core";
import { TRAINING_INTENSITY_VALUES } from "@/shared/constants/training-intensity";

export const trainingIntensity = pgEnum("training_intensity", TRAINING_INTENSITY_VALUES);
