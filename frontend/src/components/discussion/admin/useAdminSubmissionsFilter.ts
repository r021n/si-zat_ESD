import { useState, useEffect } from "react";
import type { SubmissionItem, AnnouncementItem } from "../../../types/discussion";
import { useDebounce } from "../../../hooks/useDebounce";

export const SUBMISSION_PAGE_SIZE = 10;

export function useAdminSubmissionsFilter(
  submissionsList: SubmissionItem[],
  selectedForSubmissions: AnnouncementItem | null,
) {
  const [searchSubmissionQuery, setSearchSubmissionQuery] = useState<string>("");
  const debouncedSearchSubmissionQuery = useDebounce(searchSubmissionQuery, 300);
  const [submissionFilterStatus, setSubmissionFilterStatus] = useState<"all" | "graded" | "ungraded">("all");
  const [submissionSort, setSubmissionSort] = useState<"newest" | "oldest" | "highest" | "lowest" | "name">("newest");
  const [submissionPage, setSubmissionPage] = useState<number>(1);

  useEffect(() => {
    setSubmissionPage(1);
  }, [debouncedSearchSubmissionQuery, submissionFilterStatus, submissionSort, selectedForSubmissions]);

  const totalSubmissionsCount = submissionsList.length;
  const gradedCount = submissionsList.filter(
    (s) => s.grade !== undefined && s.grade !== null,
  ).length;
  const ungradedCount = totalSubmissionsCount - gradedCount;

  const filteredSubmissions = submissionsList.filter((s) => {
    if (submissionFilterStatus === "graded" && (s.grade === undefined || s.grade === null))
      return false;
    if (submissionFilterStatus === "ungraded" && s.grade !== undefined && s.grade !== null)
      return false;

    if (!debouncedSearchSubmissionQuery.trim()) return true;
    const q = debouncedSearchSubmissionQuery.toLowerCase();
    return (
      s.studentName.toLowerCase().includes(q) ||
      (s.studentClass || "").toLowerCase().includes(q)
    );
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (submissionSort === "name") return a.studentName.localeCompare(b.studentName);
    if (submissionSort === "highest") return (b.grade ?? -1) - (a.grade ?? -1);
    if (submissionSort === "lowest") return (a.grade ?? 999) - (b.grade ?? 999);
    if (submissionSort === "oldest")
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  const totalSubmissionPages = Math.ceil(sortedSubmissions.length / SUBMISSION_PAGE_SIZE) || 1;
  const paginatedSubmissions = sortedSubmissions.slice(
    (submissionPage - 1) * SUBMISSION_PAGE_SIZE,
    submissionPage * SUBMISSION_PAGE_SIZE,
  );

  return {
    searchSubmissionQuery,
    setSearchSubmissionQuery,
    submissionFilterStatus,
    setSubmissionFilterStatus,
    submissionSort,
    setSubmissionSort,
    submissionPage,
    setSubmissionPage,
    totalSubmissionsCount,
    gradedCount,
    ungradedCount,
    sortedSubmissions,
    totalSubmissionPages,
    paginatedSubmissions,
  };
}
