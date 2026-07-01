# Feature Request

## 1. Feature Information

### Feature Name

Course Tag Management

### Short Description

Implement a course tagging system that supports pending tags during course submission, official tag creation after course approval, tag reuse, and browsing courses by tags.

### Priority

High

### Estimated Complexity

Medium

---

# 2. Business Context

## Problem

Currently, users can only discover courses by searching keywords. The system does not provide a tagging mechanism to categorize courses into topics such as Backend, Frontend, AI, DevOps, etc.

In addition, every course submitted by a Course Provider must be reviewed and approved by an Academic Manager before it becomes public.

If Course Providers are allowed to create global tags immediately, the system may contain duplicated or low-quality tags before any review.

Therefore, tags should only become official after the course is approved.

---

## Goal

After implementing this feature:

- Course Providers can assign tags while creating or editing a course.
- Course Providers can reuse existing tags.
- Submitted tags remain pending until the course is approved.
- Academic Managers can review, edit, remove, or add tags during the approval process.
- Academic Managers can reuse existing tags.
- Academic Managers can create new tags independently.
- Official tags are created only after course approval.
- Learners can browse approved courses by selecting tags.
- One course can have multiple tags.
- One tag can belong to multiple courses.

---

# 3. Functional Requirements

## Requirement 1 — Submit Tags When Creating or Updating Course

### Description

When creating or updating a course, Course Providers can assign multiple tags. But with the course approved, Course Provider mustn't edit tags approved

The tag selector should allow:

- searching existing tags
- selecting existing tags
- entering new tag names

Submitted tags are considered **pending tags**.

Pending tags must NOT create records inside:

- tags
- course_tags

until the course is approved.

### Acceptance Criteria

- Course Provider can select existing tags.
- Course Provider can submit new tag names.
- Duplicate tags are ignored.
- Pending tags are stored successfully.
- No official tags are created.
- Course Provider mustn't edit the tags approved

---

## Requirement 2 — Review Pending Tags

### Description

When reviewing a pending course, Academic Manager can:

- keep submitted tags
- remove tags
- rename tags
- add existing tags
- create additional new tags

The edited list becomes the final tag list.

### Acceptance Criteria

- Academic Manager can modify tags.
- Academic Manager can reuse existing tags.
- Academic Manager can create additional tags.

---

## Requirement 3 — Approve Course

### Description

When approving a course, the backend must:

1. Normalize all tag names.
2. Find existing tags.
3. Create missing tags.
4. Create course-tag relationships.
5. Mark course as APPROVED.

All operations must execute inside one database transaction.

### Acceptance Criteria

- Existing tags are reused.
- Missing tags are created.
- Duplicate tags are prevented.
- course_tags records are created.
- Rollback if any step fails.

---

## Requirement 4 — Reject Course

### Description

If the course is rejected:

- No records are inserted into tags.
- No records are inserted into course_tags.

Pending tags remain part of the rejected submission.

### Acceptance Criteria

- Rejecting a course never creates official tags.

---

## Requirement 5 — Academic Manager Create Tag

### Description

Academic Manager can create tags independently.

The tag becomes immediately available to everyone.

### Acceptance Criteria

- Only Academic Manager can access this feature.
- Tag names must be unique.
- Duplicate names are rejected.

---

## Requirement 6 — Get All Tags

### Description

Provide API for retrieving all available tags.

Used for autocomplete.

### Acceptance Criteria

- Return id.
- Return name.
- Sort alphabetically.

---

## Requirement 7 — Search Existing Tags

### Description

Both Course Provider and Academic Manager can search existing tags while typing.

Autocomplete should suggest matching tags.

### Acceptance Criteria

- Search is case-insensitive.
- Existing tags are suggested.
- Selecting existing tag never creates duplicate.

---

## Requirement 8 — Browse Courses By Tag

### Description

Users can browse approved courses by selecting a tag.

### Acceptance Criteria

- Support pagination.
- Return only approved courses.
- Empty list if none exists.

---

## Requirement 9 — Course Detail

### Description

Course Detail API returns all associated tags.

### Acceptance Criteria

- Tags are included.
- Sorted alphabetically.

---

# 4. User Flow

## Course Provider

```
Create Course

↓

Search Existing Tags

↓

Select Existing Tags
or
Input New Tags

↓

Submit Course

↓

Course Status = PENDING

↓

Pending Tags Stored
```

---

## Academic Manager

```
Review Pending Course

↓

Review Pending Tags

↓

Reuse Existing Tags

↓

Edit Tags

↓

Approve

↓

Normalize Tags

↓

Reuse Existing Tags

↓

Create Missing Tags

↓

Insert course_tags

↓

Course Status = APPROVED
```

---

## Learner

```
Open Course

↓

Click Tag

↓

Get Courses By Tag

↓

Display Courses
```

---

# 5. API Requirements

## Course

APIs of relate of course implemented in course modules (You can see in modules/course)

---

## Tags

GET /tags

GET /tags/search?keyword=

POST /tags

GET /tags/{id}/courses?page=&limit=

---

# 6. Database Changes

## Tables

### tags

- tag_id
- name (UNIQUE)
- description
- created_at

---

### course_tags

- course_id
- tag_id

Composite Primary Key

(course_id, tag_id)

---

### Pending Tags

Pending tags should be stored with the course while status = PENDING.

Implementation can be:

- JSON column
- Separate table

depending on project architecture.

---

# 7. Business Rules

1. One course can have multiple tags.

2. One tag can belong to multiple courses.

3. Pending tags are not official tags.

4. Official tags only exist after approval.

5. Academic Manager has final authority over tags.

6. Existing tags must always be reused whenever possible.

7. New tags should only be created when no matching tag exists.

8. Tag names are case-insensitive.

Example

Backend

backend

BACKEND

→ One tag.

9. Trim spaces automatically.

10. Maximum 10 tags per course.

11. Maximum tag length is 30 characters.

12. Empty tag is invalid.

13. Rejecting a course never creates tags.

14. Deleting a course only removes course_tags.

15. Tags are never deleted automatically.

16. Approval, tag creation, and relationship creation must execute inside one transaction.

---

# 8. Validation Rules

| Field | Rule |
|--------|------|
| tags | max 10 |
| tag | required |
| tag | trim spaces |
| tag | max 30 chars |
| tag | case-insensitive |
| tag | no duplicates |

---

# 9. Authorization

| Role | Permission |
|------|------------|
| Course Provider | Submit pending tags, reuse existing tags |
| Academic Manager | Review tags, reuse tags, create tags, approve courses |
| Learner | View tags |

---

# 10. Error Handling

| Scenario | Expected |
|----------|----------|
| Empty tag | 400 |
| Too many tags | 400 |
| Duplicate tag | Ignore |
| Invalid course | 404 |
| DB error | 500 |

---

# 11. Edge Cases

- Same tag twice.
- Backend / backend / BACKEND.
- Empty spaces.
- Multiple approvals simultaneously.
- Existing tag reused.
- Course rejected.
- Course deleted.
- Two managers approve courses containing the same new tag simultaneously.

---

# 12. Non-functional Requirements

### Performance

Avoid N+1 queries.

Batch insert relationships.

### Security

Validate every input.

### Scalability

Support thousands of tags.

### Transaction

Approval must be atomic.

### Logging

Log failures during approval.

---

# 13. UI Requirements

## Course Create/Edit

- Multi-select tag input.
- Search existing tags.
- Autocomplete.
- Select existing tags.
- Create new tags.
- Prevent duplicate selections.

---

## Academic Review

- View pending tags.
- Search existing tags.
- Select existing tags.
- Remove tags.
- Rename tags.
- Add new tags.

---

## Course Detail

Display clickable tags.

---

## Course Listing

Click tag → filter courses.

---

# 14. Files Expected To Change

Backend

- Course Module
- DTO
- Entity
- Repository
- Service
- Controller

---

# 15. Coding Requirements

- Follow project architecture.
- Reuse existing services.
- No duplicate business logic.
- Repository pattern.
- Use transactions or not if no need
- Exception handling.
- Clean code.
- No hardcoded values.

---

# 16. Testing Requirements

### Unit Test

- Tag normalization
- Duplicate removal
- Existing tag lookup
- Pending tags
- Tag creation

### Integration Test

- Create course
- Approve course
- Reject course
- Search tags
- Browse by tag

### Manual Test

- Submit pending tags
- Approve course
- Reject course
- Reuse tags
- Create tag

---

# 17. Acceptance Criteria

- Course Provider can submit pending tags.
- Existing tags can be reused.
- Academic Manager can review tags.
- Academic Manager can create tags.
- Tags are only created after approval.
- Duplicate tags are prevented.
- Users can browse courses by tags.
- All approval operations are transactional.

---

# 18. Out Of Scope

- Tag hierarchy.
- Trending tags.
- Tag recommendation.
- Tag analytics.

---

# 19. Notes

- tags stores official tags.
- course_tags stores many-to-many relationships.
- Pending tags are temporary.
- Existing tags should always be reused before creating new ones.
- The UI should encourage selecting existing tags instead of creating new ones.

---

# 20. Questions

If any requirement is unclear:

- Do NOT assume business logic.
- Ask for clarification before implementation.

# AI Agent Instructions

## Before Coding

Trước khi viết code:

1. Đọc toàn bộ code liên quan.
2. Xác định architecture hiện tại.
3. Tìm các service/repository có thể reuse.
4. Không tạo code mới nếu đã có implementation tương tự.
5. Nếu requirement chưa rõ -> hỏi lại.
6. Không tự ý thay đổi business logic cũ.
7. Chia implementation thành các stage để tôi có thể review

---

## While Coding

- Follow existing coding style.
- Follow existing folder structure.
- Keep functions small.
- Avoid duplicated logic.
- Prefer composition over duplication.
- Validate all inputs.
- Handle all excepreview
- Write meaningful variable names.review
- Divide implementation be stages for my review
- Code in modules course because course-tag and tag entity has been added in this module

---

## After Coding

Kiểm tra:

- Không có compile error.
- Không có lint error.
- Không có unused import.
- Không có dead code.
- Không phá feature cũ.
- Không ảnh hưởng backward compatibility.

---

## Output Format

Sau khi hoàn thành phải trả lời theo format:

### Summary

...

### Files Changed

- file1
- file2

### Database Changes

...

### API Changes

...

### Potential Risks

...

### Remaining TODO

...

### Manual Test Steps

1.
2.
3.

### Rollback Plan

...