/**
 * @typedef {Object} StudyProgram
 * @property {string} id
 * @property {string} user_id
 * @property {string} title
 * @property {string|null} description
 * @property {string|null} category
 * @property {'iniciante'|'intermediario'|'avancado'|null} level
 * @property {'active'|'paused'|'completed'|'archived'} status
 * @property {'alta'|'media'|'baixa'|null} priority
 * @property {string|null} target_date
 * @property {number|null} weekly_hours
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string|null} archived_at
 */

/**
 * @typedef {Object} ProgramModule
 * @property {string} id
 * @property {string} program_id
 * @property {string} title
 * @property {string|null} description
 * @property {number} sort_order
 * @property {number|null} estimated_hours
 * @property {'pending'|'active'|'completed'} status
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ProgramItem
 * @property {string} id
 * @property {string} module_id
 * @property {'lesson'|'exercise'|'project'|'review'} item_type
 * @property {string} title
 * @property {string|null} description
 * @property {string|null} source_kind
 * @property {string|null} source_url
 * @property {string|null} source_text
 * @property {number|null} estimated_minutes
 * @property {string|null} due_date
 * @property {number} sort_order
 * @property {'pending'|'in_progress'|'completed'} status
 * @property {boolean} is_delivery
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ProgramSource
 * @property {string} id
 * @property {string} program_id
 * @property {'url'|'text'|'file'|'questionnaire'} source_type
 * @property {string|null} label
 * @property {string|null} source_url
 * @property {string|null} raw_text
 * @property {string|null} file_name
 * @property {Object|null} metadata_json
 * @property {string} created_at
 */
