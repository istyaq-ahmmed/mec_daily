import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import UserCard from "../components/common/cards/UserCard"

// functions
import { filterPaginationData } from "../functions"

// components
import AnimationWrapper from "../components/common/AnimationWrapper"
import Loader from "../components/common/Loader"
import BlogCard from "../components/common/cards/BlogCard"
import NodataMessage from "../components/common/NodataMessage"
import LoadMoreBtn from "../components/common/buttons/LoadMoreBtn"

const Search = () => {
    const [blogs, setBlogs] = useState(null)
    const [users, setUsers] = useState(null)

    const { query } = useParams()

    const searchBlogs = ({ page = 1, createNewArr = false }) => {
        console.log('searchBlogs',JSON.parse(localStorage.getItem('interest_weights')))
        axios
            .post(`/api/v1/blogs/search`, {
                query,
                page,
                interest:JSON.parse(localStorage.getItem('interest_weights'))
            })
            .then(async ({ data }) => {
                const formattedData = await filterPaginationData({
                    state: blogs,
                    data: data?.blogs,
                    page,
                    countRoute: "blogs/search/total-posts",
                    dataToSend: { query },
                    createNewArr,
                })

                setBlogs(formattedData)
            })
    }

  

    const resetStates = () => {
        setBlogs(null)
        setUsers(null)
    }

    useEffect(() => {
        resetStates()
        searchBlogs({ page: 1, createNewArr: true })
    }, [query])

    const UserCardWrapper = () => {
        return (
            <>
                {users == null ? (
                    <Loader />
                ) : users.length ? (
                    users.map((user, index) => {
                        return (
                            <AnimationWrapper
                                key={index}
                                transition={{
                                    duration: 1,
                                    delay: index * 0.08,
                                }}
                            >
                                <UserCard user={user} />
                            </AnimationWrapper>
                        )
                    })
                ) : (
                    <NodataMessage message="No user found" />
                )}
            </>
        )
    }

    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                
                    <>
                        {blogs === null ? (
                            <Loader />
                        ) : blogs.results.length ? (
                            blogs.results.map((blog, index) => (
                                <AnimationWrapper
                                    key={blog?.blog_id}
                                    transition={{
                                        duration: 1,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <BlogCard
                                        blog={blog}
                                        author={blog?.author?.personal_info}
                                    />
                                </AnimationWrapper>
                            ))
                        ) : (
                            <NodataMessage message="No blog published" />
                        )}

                        <LoadMoreBtn
                            state={blogs}
                            fetchDataFunc={searchBlogs}
                        />
                    </>

                    <UserCardWrapper />
            </div>

            
        </section>
    )
}

export default Search
