package com.study.domain.post;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/posts")
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

    //글목록 가져오기
    @GetMapping
    public List<Post> findAll() {
        return postService.findAllPosts();
    }

    //글 상세 보기
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
