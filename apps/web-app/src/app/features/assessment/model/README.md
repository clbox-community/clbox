- User creates Assessment template using UI in assessments collection
- System based on template creates assessment surveys for each assessee in user pending assessment surveys collection
- When assessee finishes survey (by answering last survey question via UI) system creates its copy as assessment result in collection of assessment document in assessment collection
- Assessment chapter leader can view assessment and its results from assessment collection

```
UI --(create)--> Assessment --(system for each assessee)--> UserAssessment --(system after finished)--> UserAssessmentResult
                 /team/{team}/assessment/{id}                                                          /team/{team}/assessment/{id}/result/{id}
                                                            /team/{team}/user/{assessee}/assessment-survey/{id}
                 (user)                                     (onCreate function)                         (onUpdate function when finished changes false->true) 
```
