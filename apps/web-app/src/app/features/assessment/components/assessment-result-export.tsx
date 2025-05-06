import { useAssessmentQuestionCategories } from '../state/use-assessment-question-categories';
import { Assessment, ResponseAssessmentResult, UserAssessment, WithId } from 'assessment-model';
import { Category, Question, Seniority } from '@clbox/assessment-survey';
import { assessmentResponseAssessResult } from '../model/assessment-response-assess-result';
import { AssessmentUserSeniorityToSeniority } from '../model/assessment-seniority-converter';

export const AssessmentResultExport = {
    copyResultToClipboard: function(result: (WithId & UserAssessment)[], assessment: WithId & Assessment) {
        const questionCategories = useAssessmentQuestionCategories();
        const exportData = [];
        exportData.push(getDataForSeniority(Seniority.junior, questionCategories, assessment, result));
        exportData.push(getDataForSeniority(Seniority.regular, questionCategories, assessment, result));
        exportData.push(getDataForSeniority(Seniority.senior, questionCategories, assessment, result));
        exportData.push(getExpectedNotRequired(questionCategories, assessment, result));
        const item = new ClipboardItem({
            'text/html': new Blob([exportData.join('')], { type: 'text/html' })
        });
        navigator.clipboard.write([item]);
    }
};

function getDataForSeniority(seniority: Seniority, categories: Category[], assessment: WithId & Assessment, results: (WithId & UserAssessment)[]): string {
    const result = ['<table>'];
    result.push(getHeaderForSeniority(seniority));
    const userSeniority = AssessmentUserSeniorityToSeniority(assessment.user.seniority);
    categories.forEach(c => result.push(getCategory(c, assessment.user.textForm, seniority, userSeniority, results)));
    result.push('</table>');
    return result.join('');
}

function getExpectedNotRequired(categories: Category[], assessment: WithId & Assessment, results: (WithId & UserAssessment)[]): string {
    const result = ['<table>'];
    result.push(getHeaderForNotExpected());
    const userSeniority = AssessmentUserSeniorityToSeniority(assessment.user.seniority);
    categories.forEach(c => result.push(getNotExpectedCategory(c, assessment.user.textForm, userSeniority, results)));
    result.push('</table>');
    return result.join('');
}

function getHeaderForSeniority(seniority: Seniority): string {
    const result = ['<tr>'];
    result.push(`<th>Pytania z ankiety (${seniority})</th>`);
    result.push('<th>Uwagi</th>');
    result.push('</tr>');
    return result.join('');
}

function getHeaderForNotExpected(): string {
    const result = ['<tr>'];
    result.push(`<th>Wymagania spełniane na wyższe stanowisko</th>`);
    result.push('<th>Poziom</th>');
    result.push('</tr>');
    return result.join('');
}

function getCategory(c: Category, textForm: string, seniority: Seniority, userSeniority: Seniority, results: (WithId & UserAssessment)[]) {
    const questionsForSeniority = c.questions
    .filter(q => q.seniority === seniority)
    .filter(q => filterNotExpected(userSeniority, q, results));
    const result = [];
    if (questionsForSeniority.length != 0) {
        result.push(getHeaderForCategory(c.name));
        questionsForSeniority.forEach(q => result.push(getDataRow(q, textForm)));
    }
    return result.join('');
}

function getNotExpectedCategory(c: Category, textForm: string, userSeniority: Seniority, results: (WithId & UserAssessment)[]) {
    const questionsForSeniority = c.questions.filter(q => filterExpectedNotRequired(userSeniority, q, results));
    const result = [];
    if (questionsForSeniority.length != 0) {
        result.push(getHeaderForCategory(c.name));
        questionsForSeniority.forEach(q => result.push(getDataRowForNotRequired(q, textForm)));
    }
    return result.join('');
}

function getHeaderForCategory(category: string): string {
    const result = ['<tr>'];
    result.push(`<th colspan="2">${category}</th>`);
    result.push('</tr>');
    return result.join('');
}

function getDataRow(question: Question, textForm: string) {
    const result = ['<tr>'];
    result.push(`<td>${question.text3rd ? question.text3rd[textForm] : question.text1st[textForm]}</td>`);
    result.push(`<td></td>`);
    result.push('</tr>');
    return result.join('');
}

function getDataRowForNotRequired(question: Question, textForm: string) {
    const result = ['<tr>'];
    result.push(`<td>${question.text3rd ? question.text3rd[textForm] : question.text1st[textForm]}</td>`);
    result.push(`<td>${question.seniority}</td>`);
    result.push('</tr>');
    return result.join('');
}

function filterNotExpected(userSeniority: Seniority, question: Question, results: (WithId & UserAssessment)[]) {
    return (results.some(result => {
        const resultAssessment = assessmentResponseAssessResult(userSeniority, question, result.responseValue[question.id], result.verifiedCategories);
        return resultAssessment === ResponseAssessmentResult.NotExpectedNotRequired
            || resultAssessment === ResponseAssessmentResult.NotExpectedRequired
            || resultAssessment === ResponseAssessmentResult.NotAsked;
    }));
}

function filterExpectedNotRequired(userSeniority: Seniority, question: Question, results: (WithId & UserAssessment)[]) {
    return isQuestionAboveUserSeniority(userSeniority, question) && (results.every(result => {
        const resultAssessment = assessmentResponseAssessResult(userSeniority, question, result.responseValue[question.id], result.verifiedCategories);
        return resultAssessment === ResponseAssessmentResult.ExpectedResponse ||
            resultAssessment === ResponseAssessmentResult.NotAsked;
    }));
}

function isQuestionAboveUserSeniority(userSeniority: Seniority, question: Question) {
    return (userSeniority == Seniority.junior && (question.seniority == Seniority.regular || question.seniority == Seniority.senior || question.seniority == Seniority.seniorPlus)) ||
        (userSeniority == Seniority.regular && (question.seniority == Seniority.senior || question.seniority == Seniority.seniorPlus)) ||
        (userSeniority == Seniority.senior && question.seniority == Seniority.seniorPlus);
}
