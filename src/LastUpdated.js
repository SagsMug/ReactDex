import React from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';

import {
	Link
} from "react-router-dom";

import { 
	display_fa_icon,
	display_manga_link_v2,
	display_chapter_title,
	display_lang_flag_v3,
	display_group_link_v2,
	display_user_link_v2, 
	display_alert
} from "./partials"

import API from "./MangaDexAPI/API";
import { DPagination } from "./Manga";
import { ElementUpdater } from "./utility";
import { UserContext } from "./user-context";

export class LastUpdated extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mangas: [],
			mlimit: 30,
			moffset: 0,
			mtotal: 0
		}
	}

	static contextType = UserContext;

	componentDidMount() {
		const { user, setUser } = this.context;
		console.log(user);

		if (user != null) {
			API.getFollowedManga(this.state.mlimit, this.state.moffset).then(res => {
				this.setState({
					mangas: res.data,
					mtotal: res.total
				});
			}).catch((e) => {
				console.log("User not logged in!");
			})
		}
	}

	render() {
		const { user, setUser } = this.context;

		const page_switch = (value) => {
			console.log("Set page ", value);
			//TODO: Push history?
			this.setState({
				moffset: value*this.state.mlimit
			}, () => {
				this.componentDidMount();
			});
		}

		//TODO: Select between followed and general
		//TODO: Select mlimit
		return (
			<React.Fragment>
				{user == null && display_alert("info" ,"m-2 widthfix", "Notice", [
					"Please ",
					display_fa_icon("sign-in-alt"),
					" ",
					<Link to="/login">login</Link>,
					" to see updates from your follows."
				])}
				<div className="card mb-3" style={{paddingRight: "0px", paddingLeft: "0px"}}>
					<h6 className="card-header">{display_fa_icon('sync')} Latest updates</h6>
					{/* A comment */}
					<div className="table-responsive">
						<table className="table table-striped table-sm" style={{color: "inherit"}}>
							<thead>
								<tr className="border-top-0">
									<th width="110px"></th>
									<th width="25px"></th>
									<th style={{minWidth: "150px"}}></th>
									<th className="text-center" width="30px">{display_fa_icon('globe', 'Language')}</th>
									<th style={{minWidth: "150px"}}>{display_fa_icon('users', 'Group')}</th>
									<th className="d-none d-lg-table-cell">{display_fa_icon('user', 'Uploader')}</th>
									<th className="d-none d-lg-table-cell text-center text-info">{display_fa_icon('eye', 'Views')}</th>
									<th style={{minWidth: "65px;"}} className="text-right">{display_fa_icon('clock', 'Uploaded', '', 'far')}</th>
								</tr>
							</thead>
							<tbody>
								{this.state.mangas.map((manga) => {
									const rowspan = manga.GetRelationship("chapter").length >= 4 ? 5 : manga.GetRelationship("chapter").length+1;

									return (
										<React.Fragment>
											<tr style={{color: "inherit"}}>
												<td rowSpan={rowspan}>
													<div className="medium_logo rounded" style={{
														display: "flex",
														justifyContent: "center"
													}}>
														<Link to={manga.getUrl()} style={{height: "inherit"}}>
															<img 
																className="rounded" 
																src={manga.getCover256()} 
																alt="Thumb" 
																style={{
																	objectFit: "scale-down",
																	height: "100%",
																}}
															/>
														</Link>
													</div>
												</td>
												<td className="text-right"></td>
												<td colSpan="6" height="31px" className="position-relative">
													<span className="ellipsis">
														{display_fa_icon('book', 'Title')} {display_manga_link_v2(manga)}
													</span>
												</td>
											</tr>
											{manga.GetRelationship("chapter").map((chapter) => {
												return(
													<tr style={{color: "inherit"}}>
														<td className="text-right"></td>
														<td style={{display: "flex", alignItems: "center"}}>{display_chapter_title(chapter, true)}{false && (<span className="badge badge-primary">END</span>)}</td>
														<td className="text-center">{display_lang_flag_v3("en")}</td>
														<td className="position-relative">
															<span className="ellipsis">
																{chapter.GetRelationship("scanlation_group") != null && 
																	display_group_link_v2(chapter.GetRelationship("scanlation_group")[0])}
															</span>
														</td>
														<td className="d-none d-lg-table-cell">{display_user_link_v2(chapter.GetRelationship("user")[0])}</td>
														<td className="d-none d-lg-table-cell text-center text-info">N/A</td>
														<td className="text-right text-truncate" title="">
															<ElementUpdater delay={1000} func={() => chapter.getUpdateDiff()} />
														</td>
													</tr>
												)
											})}
										</React.Fragment>
									)
								})}
							</tbody>
						</table>
					</div>
				</div>

				<DPagination 
					pages={Math.ceil(this.state.mtotal / this.state.mlimit)} 
					sizeof={this.state.mlimit} 
					callback={page_switch}
				/>
			</React.Fragment>
		)
	}
}
