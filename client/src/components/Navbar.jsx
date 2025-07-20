import { Fragment, useEffect, useState } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import axios from "axios"

import { useStateContext } from "../contexts/GlobalContext"
import {IntrestSelector} from "../screens/IntrestSelector"
// functions
import { setSession } from "../functions/session"

// assets
import { logoDark, logoLight } from "../assets"

import UserNavigationPanel from "./UserNavigationPanel"

const Navbar = () => {
	const [searchboxVisibility, setSearchBoxVisibility] = useState(false)
	const [userNavPanel, setUserNavPanel] = useState(false)
	const [searchboxFocused, setSearchboxFocused] = useState(false);
	const [searchQuery, setSearchQuery] = useState();

	const navigate = useNavigate()

	const {
		userData,
		userData: { access_token, profile_img, new_notification_available },
		updateUserData,
		// theme
		theme,
		setTheme,
	} = useStateContext()

	const changeTheme = () => {
		let newTheme = theme == "light" ? "dark" : "light"

		setTheme(newTheme)

		document.body.setAttribute("data-theme", newTheme)

		setSession("theme", newTheme)
	}

	const handleUserNavPanel = () => {
		setUserNavPanel((current) => !current)
	}
	const handleBlur = () => {
		setTimeout(() => setUserNavPanel(false), 200)
	}

	// search
	const handleSearch = (event) => {
		// const query = event.target.value
		setSearchBoxVisibility((current) => !current)

		console.log('handleSearch',event,'query',searchQuery)

		// if (event.keyCode === 13 && query.length) {
			navigate(`/search/${searchQuery}`)
			console.log("hello")
		// }
	}

	useEffect(() => {
		if (access_token) {
			axios
				.get(`/api/v1/notifications/new`, {
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				})
				.then(({ data }) => {
					updateUserData({
						type: "LOGIN",
						payload: { ...userData, ...data },
					})
				})
				.catch((error) => {
					console.log(error)
				})
		}
	}, [access_token])

	return (
		<Fragment>
			<nav className="navbar z-50">
				<Link to="/" className="flex-none w-10">
					<img
						src={theme == "light" ? logoDark : logoLight}
						alt="logo"
						className="w-full"
					/>
				</Link>

				<div
					className={
						"absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4  " +
						(searchboxVisibility ? "sow" : "hide")
					}
				>	<div className="flex">

						<input
							type="text"
							name=""
							placeholder="Search for News"
							className="w-full  bg-grey p-4 pl-6   rounded-full placeholder:text-dark-grey "
							onFocus={() => setSearchboxFocused(true)}
							onChange={(e)=> setSearchQuery(e.target.value==''?'undefined':e.target.value)}
						/>
						<button
							className=" w-1/5	   bg-dark-grey text-white p-4 pl-6   rounded-full placeholder:text-dark-grey "
							onClick={handleSearch}
						>Search</button>
					</div>


					{searchboxFocused && (
					<div
						className="mt-4 md:mt-2"
					>
						<IntrestSelector />
					</div>
					)}
				</div>
				

				<div className="flex items-center gap-3 md:gap-6 ml-auto">
					<button
						className=" bg-grey w-12 h-12 rounded-full flex items-center justify-center"
						onClick={() =>
							setSearchBoxVisibility((current) => !current)
						}
					>
						<i className="fi fi-rr-search text-xl"></i>
					</button>
					{/* <Link to="/editor" className="hidden md:flex gap-2 link">
						<i className="fi fi-rr-file-edit"></i>
						<p>Write</p>
					</Link> */}

					{/* change theme */}
					<button
						className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/20"
						onClick={changeTheme}
					>
						<i
							className={
								"fi fi-rr-" +
								(theme == "light" ? "moon-stars" : "sun") +
								" text-2xl block mt-1"
							}
						></i>
					</button>

					{/* {access_token ? (
						<>
							<Link to="/dashboard/notifications">
								<button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/20">
									<i className="fi fi-rr-bell text-2xl block mt-1"></i>
									{new_notification_available && (
										<span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span>
									)}
								</button>
							</Link>

							<div
								className="relative"
								onClick={handleUserNavPanel}
								onBlur={handleBlur}
							>
								<button className="w-12 h-12 mt-1">
									<img
										className="w-full h-full object-cover rounded-full"
										src={profile_img}
										alt="user"
									/>
								</button>

								{userNavPanel && <UserNavigationPanel />}
							</div>
						</>
					) : (
						<>
							<Link to="/signin" className="btn-dark py-2">
								Sign In
							</Link>
							<Link
								to="/signup"
								className="btn-light py-2 hidden md:block"
							>
								Sign Up
							</Link>
						</>
					)} */}
				</div>
			</nav>

			<Outlet />
		</Fragment>
	)
}

export default Navbar
