CREATE TABLE board (
    id BIGSERIAL PRIMARY KEY,                -- [PK] bigint (자동 증가)
    title VARCHAR(255) NOT NULL,             -- title character varying(255)
    content TEXT,                            -- content text
    writer_id BIGINT,                        -- writer_id bigint
    view_cnt INTEGER DEFAULT 0,              -- view_cnt integer
    delete_yn BOOLEAN DEFAULT FALSE,         -- delete_yn boolean
    created_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- created_date
    modified_date TIMESTAMP WITHOUT TIME ZONE                          -- modified_date
);