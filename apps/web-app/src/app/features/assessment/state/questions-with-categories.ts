import {QuestionWithCategory} from "./question-with-category";
import {categories} from "@clbox/assessment-survey";

export const questionsWithCategories: QuestionWithCategory[] = [];
categories.forEach(category => category.questions.forEach(question => questionsWithCategories.push({
    category, question
})));
