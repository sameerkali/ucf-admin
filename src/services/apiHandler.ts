// import {
//   keepPreviousData,
//   useMutation,
//   useQuery,
//   type UseMutationResult,
//   type UseQueryResult,
// } from "@tanstack/react-query";
// import axios, { AxiosError, type AxiosResponse } from "axios";
// import type {
//   AllStudentRequest,
//   AllStudentResponse,
//   AllyearsAdminRequest,
//   AllYearsAdminRequestType,
//   AllyearsAdminResponse,
//   AllYearsAdminType,
//   assignmentDetailReportRequest,
//   AssignmentReportRequest,
//   ContentSummaryType,
//   EmptyResponse,
//   EnableDisableLessonRequestType,
//   EnableDisableYearRequestType,
//   GetAllQuestionOfAssignmentRequest,
//   GetAllQuestionOfAssignmentResponse,
//   LessionOfYearRequestType,
//   LessionOfYearResponseType,
//   LibraryReponseType,
//   ListAssignmentAdminRequest,
//   ListAssignmentAdminResponse,
//   LoginResponseType,
//   QuestionAssessmentOfYearRequest,
//   QuestionAssessmentOfYearResponse,
//   QuestionOfLessionRequestType,
//   QuestionOfLessionResponseType,
//   StudentAssignmentRequest,
//   StudentAssignmentResponse,
//   TopRankerStudentTypes,
//   yearSectionFilterRequest,
//   yearSectionFilterResponse,
//   UpdateAssignmentRequest,
//   AssignmentDetailReportResponse,
//   AssignmentReportResponse,
//   EnableDisableQuestionRequestType,
//   assignmentResponse,
//   assignmentRequest,
//   StudentListResponse,
//   StudentListRequest,
//   StudentlessonResponse,
//   StudentlessonRequest,
//   StudentQuestionResponse,
//   StudentQuestionRequest
// } from "./apiTypes.types";
// import { login } from "../reducers/auth.reducer";
// import { useAppDispatch } from "../reducers/store";

// const axiosInstance = axios.create({
//   baseURL: "http://34.129.177.103/apiadmin/mathadmin",
//   timeout: 10000,
//   timeoutErrorMessage:
//     "Request taking longer than expected. Check your network",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: "Token a6039607dfd014db1c2ff40d25f14c4a715f0282",
//   },
// });

// axiosInstance.interceptors.response.use(
//   (response: AxiosResponse) => {
//     if (response.data?.status === "Fail") {
//       const error = new Error(response.data.message || "Unknown error");
//       (error as any).isCustomError = true;
//       (error as any).status_code = response.data.status_code;
//       throw error;
//     }
//     return response;
//   },
//   (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       localStorage.clear();
//       window.location.href = "/login";
//     }

//     const message =
//       typeof error.response?.data === "object" &&
//       error.response?.data !== null &&
//       "message" in error.response.data
//         ? (error.response.data as any).message
//         : "Unknown error";
//     const e = new Error(message);
//     (e as any).isCustomError = false;
//     (e as any).status_code = (error.response?.data as any)?.status_code;

//     return Promise.reject(e);
//   }
// );

// export const useContentSummaryQuery = (): UseQueryResult<ContentSummaryType> =>
//   useQuery({
//     queryKey: ["contentSummary"],
//     queryFn: () => axiosInstance.get("/contentSummary").then((r) => r.data),
//   });

// export const useLoginMutation = (): UseMutationResult<
//   LoginResponseType,
//   any,
//   object
// > => {
//   const dispatch = useAppDispatch();
//   return useMutation({
//     mutationKey: ["login"],
//     mutationFn: (data: object) =>
//       axiosInstance
//         .post("/login", { ...data, isAdmin: true })
//         .then((r) => r.data),
//     onSuccess: (d) => {
//       dispatch(login(d));
//     },
//   });
// };

// export const useTopRankerListQuery = (): UseQueryResult<
//   TopRankerStudentTypes,
//   any
// > => {
//   return useQuery({
//     queryKey: ["topRankerStudent"],
//     queryFn: (data) =>
//       axiosInstance.get("/topRankerStudent", data).then((r) => r.data),
//   });
// };

// export const useAllYearsAdminMutation = (): UseMutationResult<
//   AllYearsAdminType,
//   any,
//   AllYearsAdminRequestType
// > => {
//   return useMutation({
//     mutationKey: ["allYearsAdmin"],
//     mutationFn: (data) =>
//       axiosInstance.post("/allyearsAdmin", data).then((r) => r.data),
//   });
// };

// export const useEnableYearMutation = () =>
//   useMutation({
//     mutationKey: ["enableYear"],
//     mutationFn: (data: EnableDisableYearRequestType) =>
//       axiosInstance.post("/selectedyear", data).then((r) => r.data),
//   });

// export const useDisableYearMutation = () =>
//   useMutation({
//     mutationKey: ["disableYear"],
//     mutationFn: (d: EnableDisableYearRequestType) =>
//       axiosInstance.post("/deleteYear", d).then((r) => r.data),
//   });

// export const useEnableLessonMutation = () =>
//   useMutation({
//     mutationKey: ["enableLesson"],
//     mutationFn: (d: EnableDisableLessonRequestType) =>
//       axiosInstance.post("/selectedlesson", d).then((r) => r.data),
//   });

// export const useDisableLessonMutation = () =>
//   useMutation({
//     mutationKey: ["disableLesson"],
//     mutationFn: (d: EnableDisableLessonRequestType) =>
//       axiosInstance.post("/deleteLesson", d).then((r) => r.data),
//   });

// export const useEnableQuestionMutation = () =>
//   useMutation({
//     mutationKey: ["enableQuestion"],
//     mutationFn: (d: EnableDisableQuestionRequestType) =>
//       axiosInstance.post("/selectedquestion", d).then((r) => r.data),
//   });

// export const useDisableQuestionMutation = () =>
//   useMutation({
//     mutationKey: ["disableQuestion"],
//     mutationFn: (d: EnableDisableQuestionRequestType) =>
//       axios
//         .post("http://34.129.177.103/apiadmin/deleteQuestion", d, {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: "Token a6039607dfd014db1c2ff40d25f14c4a715f0282",
//           },
//         })
//         .then((r) => r.data),
//   });

// export const useLessonsOfYear = (
//   yearId: number
// ): UseMutationResult<
//   LessionOfYearResponseType,
//   Error,
//   LessionOfYearRequestType
// > =>
//   useMutation({
//     mutationKey: ["lessionOfYearAdmin", yearId],
//     mutationFn: (data) =>
//       axiosInstance.post("/lessionOfYearAdmin", data).then((r) => r.data),
//   });

// export const useQuestionsOfLessonMutation = (): UseMutationResult<
//   QuestionOfLessionResponseType,
//   Error,
//   QuestionOfLessionRequestType
// > =>
//   useMutation({
//     mutationKey: ["question"],
//     mutationFn: (data) =>
//       axios
//         .post("http://34.129.177.103/apiadmin/questionoflession", data, {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: "Token a6039607dfd014db1c2ff40d25f14c4a715f0282",
//           },
//         })
//         .then((r) => r.data),
//   });

// export const useQuestionsOfLesson = (data: QuestionOfLessionRequestType) =>
//   useQuery({
//     queryKey: ["questions", data.LessionId, data.page],
//     queryFn: () =>
//       axios
//         .post("http://34.129.177.103/apiadmin/questionoflession", data, {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: "Token a6039607dfd014db1c2ff40d25f14c4a715f0282",
//           },
//         })
//         .then((r) => r.data),
//     placeholderData: keepPreviousData,
//   });

// // assignment (worksheet)
// export const useListAssignmentadmin = (): UseMutationResult<
//   ListAssignmentAdminResponse,
//   Error,
//   ListAssignmentAdminRequest
// > => {
//   return useMutation({
//     mutationKey: ["listassignmentadmin"],
//     mutationFn: (data) =>
//       axiosInstance.post("/listAssignmentadmin", data).then((r) => r.data),
//   });
// };

// export const useAssignmentDetailReport = (): UseMutationResult<
// AssignmentDetailReportResponse,
//   Error,
//   assignmentDetailReportRequest
// > => {
//   return useMutation({
//     mutationKey: ["assignmentDetailReport"],
//     mutationFn: (data) =>
//       axiosInstance.post("/assignmentDetailReport", data).then((r) => r.data),
//   });
// };

// //step 1
// export const useYearSectionFilter = (): UseMutationResult<
// yearSectionFilterResponse,
//   Error,
//   yearSectionFilterRequest
// > => {
//   return useMutation({
//     mutationKey: ["yearSectionFilter"],
//     mutationFn: (data) =>
//       axiosInstance.post("/yearSectionFilter", data).then((r) => r.data),
//   });
// };


// //step 2
// export const useAllStudent = (): UseMutationResult<
//   AllStudentResponse,
//   Error,
//   AllStudentRequest
// > => {
//   return useMutation({
//     mutationKey: ["allStudent"],
//     mutationFn: (data) =>
//       axiosInstance.post("/allStudent", data).then((r) => r.data),
//   });
// };

// export const useAllyearsAdmin = (): UseMutationResult<
//   AllyearsAdminResponse,
//   Error,
//   AllyearsAdminRequest
// > => {
//   return useMutation({
//     mutationKey: ["allyearsAdmin"],
//     mutationFn: (data) =>
//       axiosInstance.post("/allyearsAdmin", data).then((r) => r.data),
//   });
// };

// //step 3
// export const useStudentAssignment = (): UseMutationResult<
//  StudentAssignmentResponse,
//   Error,
//   StudentAssignmentRequest
// > => {
//   return useMutation({
//     mutationKey: ["studentAssignment"],
//     mutationFn: (data) =>
//       axiosInstance.post("/studentAssignment", data).then((r) => r.data),
//   });
// };
// export const useLibrary = (
//   adminId?: string
// ): UseQueryResult<LibraryReponseType> => {
//   const fetchData = async () =>
//     await axiosInstance
//       .post("/getGenratedQuestion", { adminId })
//       .then((res) => res.data);
//   return useQuery({
//     queryKey: ["libraryData", adminId],
//     queryFn: fetchData,
//   });
// };

// // 4 API added by kshitiz
// export const useQuestionAssessmentOfYearQuery = (
//   payload: QuestionAssessmentOfYearRequest
// ): UseQueryResult<QuestionAssessmentOfYearResponse> => {
//   return useQuery({
//     queryKey: ["questionAssessmentOfYear", payload],
//     queryFn: () =>
//       axiosInstance
//         .post("/questionassementOfYear", payload)
//         .then((res) => res.data),
//     enabled: !!payload.YearId,
//   });
// };

// export const useQuestionAssignmentMutation = (): UseMutationResult =>
//   useMutation({
//     mutationFn: (data) =>
//       axiosInstance.post("/questionAssignment", data).then((r) => r.data),
//   });

// export const useUpdateAssignmentMutation = (): UseMutationResult<
//   EmptyResponse,
//   Error,
//   UpdateAssignmentRequest
// > =>
//   useMutation({
//     mutationFn: (d) =>
//       axiosInstance.post("/updateAssignment", d).then((r) => r.data),
//   });

// export const useGetAllQuestionOfAssignmentQuery = (
//   payload: GetAllQuestionOfAssignmentRequest
// ): UseQueryResult<GetAllQuestionOfAssignmentResponse> => {
//   return useQuery({
//     queryKey: ["getAllQuestionOfAssignment", payload],
//     queryFn: () =>
//       axiosInstance
//         .post("/getallquestionofassigenment", payload)
//         .then((r) => r.data),
//     enabled: !!payload.assignmentId,
//   });
// };

// export const useAssignmentReport = (): UseMutationResult<
//   AssignmentReportResponse,
//   Error,
//   AssignmentReportRequest
// > => {
//   return useMutation({
//     mutationKey: ["assignmentreport"],
//     mutationFn: (data) =>
//       axiosInstance.post("/assignmentreport", data).then((r) => r.data),
//   });
// };

// export const useAssignment = (): UseMutationResult<
//   assignmentResponse,
//   Error,
//   assignmentRequest
// > => {
//   return useMutation({
//     mutationKey: ["assignment"],
//     mutationFn: (data) =>
//       axiosInstance.post("/assignment", data).then((r) => r.data),
//   });
// };

// //Insights 

// //page 1
// export const useStudentList = (): UseMutationResult<
//   StudentListResponse,
//   Error,
//   StudentListRequest
// > => {
//   return useMutation({
//     mutationKey: ["studentList"],
//     mutationFn: (data) =>
//       axiosInstance.post("/studentList", data).then((r) => r.data),
//   });
// };

// //page 2
// export const useStudentlesson = (): UseMutationResult<
//   StudentlessonResponse,
//   Error,
//   StudentlessonRequest
// > => {
//   return useMutation({
//     mutationKey: ["studentlesson"],
//     mutationFn: (data) =>
//       axiosInstance.post("/studentlesson", data).then((r) => r.data),
//   });
// };

// //page 3
// export const useStudentQuestion = (): UseMutationResult<
//   StudentQuestionResponse,
//   Error,
//   StudentQuestionRequest
// > => {
//   return useMutation({
//     mutationKey: ["studentQuestion"],
//     mutationFn: (data) =>
//       axiosInstance.post("/studentQuestion", data).then((r) => r.data),
//   });
// };