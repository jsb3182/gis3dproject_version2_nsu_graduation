<template>
    <template>
        <div class="board-container">
            <h2>게시판</h2>
            <table>
                <thead>
                    <tr>
                        <th>번호</th>
                        <th> 제목</th>
                        <th>작성자 ID</th>
                        <th>날짜</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="post in posts" :key="post.id">
                        <td>{{ post.id }}</td>
                        <td>{{ post.title }}</td>
                        <td>{{ post.writerId }}</td>
                        <td>{{ new Date(post.createdDate).toLocaleDateString() }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </template>
</template>
<script setup>
    import{ref, onMounted} from 'vue';
    import {postApi} from '@/utils/api';
    const posts = ref([]);
    //컴초너트가 로드될때 데이터를 가져오기
    onMounted(async () => {
        try {
            const response = await postApi.getPosts();
            posts.value = response.data;
        }catch (error){
            alert('게시판 데이터를 불러오는데 실패했습니다.');
            console.error('게시판 데이터 로드 에러:', error);
        }
    });
</script>