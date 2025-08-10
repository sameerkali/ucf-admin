// export type ContentSummaryType = {
//   data: {
//     totalQuestion: number;
//     totalYear: number;
//     totalVideaoLesson: number;
//     totalBadges: number;
//   };
// }

// export type EmptyResponse = {
//   status_code: string;
//   status: string;
//   message: string;
//   data: {};
// };

// export type LoginResponseType = {
//   status_code: string;
//   status: string;
//   message: string;
//   data: UserType[];
//   incorrectAttempts: number;
// };


// export type TopRankerStudentTypes = {
//   data: Array<{
//     userId: string;
//     user_name: string;
//     profilephotos: string;
//     points: number;
//   }>;
// };


// export type AllYearsAdminRequestType = {
//   adminId: number;
//   page: number;
//   limit: number;
// };

// export type AllYearsAdminType = {
//   status_code: string;
//   status: string;
//   message: string;
//   data: Array<{
//     model: string;
//     pk: number;
//     fields: {
//       year: string;
//       created_date: string;
//       updated_date: string;
//       yearId: number;
//       isSelect: string;
//     };
//   }>;
// };

// export type EnableDisableYearRequestType = {
//   yearId: number[];
//   adminId: number;
// };

// export type EnableDisableLessonRequestType = {
//   lessonId: number[];
//   adminId: number;
//   yearId: number;
// };


// export type LessionOfYearRequestType = {
//   adminId: number;
//   yearId: number;
//   page: number;
//   limit: number;
//   startLesson?: number;
//   endLesson?: number;
// };



// export type QuestionOfLessionRequestType = {
//   LessionId: number;
//   schoolId: number;
//   adminId: number;
//   page: number;
//   limit: number;
//   complexity?: number;
// };



// export type LessionOfYearResponseType = {
//   status_code: string;
//   status: string;
//   message: string;
//   data: Array<{
//     model: string;
//     pk: number;
//     fields: {
//       year: number;
//       lession: string;
//       lessonImage: string;
//       lessonPendingImage: string;
//       lessonTopics: string;
//       lessonCompletedImage: string;
//       Imagelabel: string;
//       created_date: string;
//       updated_date: string;
//       LessonType: string;
//       isSelect: string;
//       LessionId: string;
//     };
//   }>;
// };



// export type QuestionOfLessionResponseType = {
//   status_code: string;
//   status: string;
//   message: string;
//   data: Array<{
//     model: string;
//     pk: number;
//     fields: {
//       lession: number;
//       question: string;
//       QuestionImage: string;
//       background: string;
//       questionType: string;
//       complexity: string;
//       answear: string[];
//       explaination: string;
//       audio: string;
//       option1: string;
//       option2: string;
//       option3: string;
//       created_date: string;
//       updated_date: string;
//       QuestionId: string;
//       isAdded: string;
//       imageList: string[];
//       answer: string[];
//       questionimagelist: string[];
//       questionaudio: string[];
//     };
//   }>;
//   videourl: Array<{
//     model: string;
//     pk: number;
//     fields: {
//       lession: number;
//       videourl: string;
//       created_date: string;
//       updated_date: string;
//     };
//   }>;
// };





// export type ListAssignmentAdminResponse = {
//   status_code: string;
//   status: string;
//   message: string;
//   data: Array<{
//     model: string;
//     pk: number;
//     fields: {
//       title: string;
//       description: string;
//       startTime: string;
//       endTime: string;
//       section: string;
//       isPublish: boolean;
//       created_date: string;
//       updated_date: string;
//       adminId: number;
//       year: string;
//     };
//   }>;
// };

// export type AssignmentReportRequest = {
//   assignmentId: number;
// };


// export type AssignmentDetailReportResponse = {
//   assignment_id: number;
//   student_id: number;
//   total_questions: number;
//   accuracy_percentage: number;
//   incorrect_answer: number;
//   correct_answers: number;
//   questions: Array<{
//     question: string;
//     QuestionImage: string;
//     background: string;
//     questionType: string;
//     complexity: string;
//     answear: string[];
//     explaination: string;
//     audio: string;
//     option1: string;
//     option2: string;
//     option3: string;
//     created_date: string;
//     updated_date: string;
//     QuestionId: string;
//     isAdded: string;
//     imageList: string[];
//     answer: string[];
//     questionimagelist: string[];
//     questionaudio: string[];
//   }>;
//   videourl: Array<{
//     model: string;
//     pk: number;
//     fields: {
//       lession: number;
//       videourl: string;
//       created_date: string;
//       updated_date: string;
//     };
//   }>;
// };


// export type GetAllQuestionOfAssignmentRequest = {
//   assignmentId: number;
// };

// export type GetAllQuestionOfAssignmentResponse = {
//   status_code: string;
//   status: string;
//   message: string;
//   data: Array<{
//     model: string;
//     pk: number;
//     fields: {
//       userId: string;
//       user_name: string;
//       email: string;
//       password: string;
//       parents_date_of_birth?: string;
//       profilephotos: string;
//       jwtoken: string;
//       lessonid: string;
//       questionid: string;
//       appVersion: string;
//       isPaid: string;
//       appStartTime: string;
//       appEndTime: string;
//       schoolName: string;
//       school: number;
//       year: string;
//       section: string;
//       created_date: string;
//       updated_date: string;
//       timeExtensionReq: boolean;
//     };
//   }>;
// };


// export type ListAssignmentAdminRequest = {
//   adminID: number;
// };






// export type assignmentDetailReportRequest = {
//   assignmentId: number;
//   studentId: number;
// };



// export type UpdateAssignmentRequest = {
//   assignmentId: number;
//   isPublish: number;
//   startTime: string;
//   endTime: string;
//   yearId: string;
// };


// export type yearSectionFilterRequest = {
//     schoolId: number;
//     adminId: number;
// };

// export type yearSectionFilterResponse = Array<{
//   year__year: string;
//   year: number;
//   section: string;
// }>;

// export type AllStudentRequest = {
//   adminId: number;
//   schoolId: number;
//   yearId: string;
//   section: string;
// };

// export type AllStudentResponse = Array<{
//   id: number;
//   question: string;
//   questionType: string;
// }>;

// export type StudentAssignmentResponse = {
//   assignmentId: number;
//   studentId: number[];
// };

// export type StudentAssignmentRequest = {
//   status_code: string;
//   status: string;
//   message: string;
//   data: string;
//   totalQuestion: number;
//   remain: number;
//   completedQuestion: number;
//   fields: {
//     lession: number;
//     question: string;
//     QuestionImage: string;
//     background: string;
//     questionType: string;
//     complexity: string;
//     explaination: string;
//     audio: string;
//     option1: string;
//     option2: string;
//     option3: string;
//     created_date: string;
//     updated_date: string;
//     questionId: string;
//     answear: string[];
//     yearId: string;
//     marks: number;
//     questionimagelist: string[];
//     questionaudio: string[];
//     imageList: string[];
//   };
// };

// export type LibraryReponseType = {
//   status: number;
//   assignments: string[][];
// };

// export type AllyearsAdminRequest = {
//   adminId: number
//   limit: number
//   page: number
// };

// export type AllyearsAdminResponse = {
//   status_code: string;
//   status: string;
//   message: string;
//   data: Array<{
//     model: string;
//     pk: number;
//     fields: {
//       lession: number;
//       question: string;
//       QuestionImage: string;
//       background: string;
//       questionType: string;
//       complexity: string;
//       explaination: string;
//       audio: string;
//       option1: string;
//       option2: string;
//       option3: string;
//       created_date: string;
//       updated_date: string;
//       questionId: string;
//       answear: string[];
//       yearId: string;
//       marks: number;
//       questionimagelist: string[];
//       questionaudio: string[];
//       imageList: string[];
//     };
//   }>;
// };



// export type QuestionAssessmentOfYearRequest = {
//   YearId: string;
// };

// export type QuestionAssessmentOfYearResponse = {
//   status_code: string;
//   status: string;
//   message: string;
//   data: Array<{
//     student_id: number;
//     student_name: string;
//     completionStatus: string;
//     total_marks: number;
//     obtained_marks: number;
//   }>;
// };

// export type EnableDisableQuestionRequestType = {
//   adminId: number;
//   yearId?: number;
//   lessonId?: number;
//   questionId: Array<number>;
// };

// export type AssignmentReportResponse = {
//   status_code: string;
//   status: string;
//   message: string;
//   data: Array<{
//     student_id: number;
//     student_name: string;
//     completionStatus: string;
//     total_marks: number;
//     obtained_marks: number;
//   }>;
// };

// export type assignmentResponse = {
//   status_code: string
//   status: string
//   message: string
//   data: {
//     id: number
//     title: string
//     description: string
//     startTime: string
//     endTime: string
//   }
// };

// export type assignmentRequest = {
//   title: string;
//   description: string;
//   adminId: number;
//   section?: string | undefined;
//   yearId?: number | undefined;
// };

// //Insights 
// //page1
// export type StudentListResponse = {
// status_code: string
//   status: string
//   message: string
//   data: Array<{
//     userId: string
//     user_name: string
//     email: string
//     year: string
//     section: string
//     studentId: number
//   }>
//   total_pages: number
// }
// export type StudentListRequest = {
//   schoolId: number
//   yearId: number
//   section: string
//   studentName: string
//   page: number
//   limit: number
// }

// //page2
// export type StudentlessonResponse = {
//   status_code: string
//   status: string
//   message: string
//   data: Array<{
//     lessonTopics: string
//     lessonId: number
//     yearId: number
//     lesson: string
//     points: number
//     totalQuestions: number
//     videocount: number
//     performance: number
//     status: string
//   }>
//   total_pages: number
// }
// export type StudentlessonRequest = {
//     yearId: number
//   studentId: string
//   page: number
//   limit: number
// }

// //page3
// export type StudentQuestionResponse = {
//   data: {
//     total_questions: number
//     strong_percentage: number
//     average_percentage: number
//     weak_percentage: number
//     accuracy_percentage: number
//     question_data: Array<{
//       question: string
//       level: string
//     }>
//     total_pages: number
//   }
// }
// export type StudentQuestionRequest = {
//     lessonId: number
//   studentId: string
//   page: number
//   limit: number
// }