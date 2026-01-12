package com.study.domain.post;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/posts") //모든 메서드의 반환값을 json 형태로 응답 @ResponseBodyMapping 게시판 api url
public class PostApiController {
    private final PostService postService;

    public PostApiController(PostService postService) {
        this.postService = postService;
    }

    //글 쓰기
    @PostMapping
    public Long save(@RequestBody PostRequest params) {
        return postService.savePost(params);
    }

    //글목록 가져오기 전체 게시글 조회하기 삭제되지 않은 글만 조회 최신순 정렬 처리
    @GetMapping
    public List<Post> findAll() {
        return postService.findAllPosts();
    }

    //글 상세 보기 요청, url 경로 변수 조회수 증가 삭제 여부 체크
    @GetMapping("/{id}")
    public Post findById(@PathVariable Long id) {
        return postService.findPostById(id);
    }

    //글 수정 (PUT /api/posts/{id})
    @PutMapping("/{id}")
    public Post update(@PathVariable Long id, @RequestBody PostRequest params) {
        return postService.updatePost(id, params);
    }

    //글 삭제
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        postService.deletePost(id);
        return "삭제완료";
    }
}
