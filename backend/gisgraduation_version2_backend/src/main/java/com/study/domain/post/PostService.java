package com.study.domain.post;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class PostService {
    private final PostRepository postRepository;
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }
    //게시글 저장하기
    @Transactional //이 메서드 안에 작업이면 전부 트렌젝션에 묶습니다.
    public Long savePost(PostRequest params) {
        Post post = new Post(params.getTitle(), params.getContent(),params.getWriterId());
        return postRepository.save(post).getId();
    }
    //게시글 조회하기
    public List<Post> findAllPosts() {
        return postRepository.findAllByDeleteYnFalse();
    }
    //게시글 상세 조회 및 조회수 증가 (Read)
    @Transactional
    public Post findPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을수 없다"));
        //조회수 증가
        post.setViewCnt(post.getViewCnt() + 1);
        return post;
    }

    //게시글 수정하기
    @Transactional
    public Post updatePost(Long id, PostRequest params) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        // 제목과 내용 수정
        post.setTitle(params.getTitle());
        post.setContent(params.getContent());
        post.setModifiedDate(LocalDateTime.now());

        return postRepository.save(post);
    }

    //게시글 삭제하기
    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을수 없다 "));
        post.setDeleteYn(true);//db에서 지우지 않고 상태만 변경
    }

}
