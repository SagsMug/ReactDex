import React, { useState } from "react";
import Container from 'react-bootstrap/Container';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import axios from "axios";

import './css/Chapter.css';

import {
	Link,
	Navigate
} from "react-router-dom";

import { 
	display_fa_icon, 
	display_alert, 
	display_manga_link_v2, 
	display_short_title, 
	display_user_link, 
	display_user_link_v2,
	display_group_link_v2 ,
	display_lang_flag_v3,
	display_labels
} from "./partials"

import { UserContext } from "./user-context";

import API, {slugify} from "./MangaDexAPI/API";
import { getElementByXpath, checkVisible } from "./utility";

function setAdvancedSettings(val) {
	if (val == null) {
		val = false;
	}

	if (val) {
		document.getElementById("modal-settings").classList.add("show-advanced");
	} else {
		document.getElementById("modal-settings").classList.remove("show-advanced");
	}

	return val;
}
function setDataSaver(val) {
	if (val == null) {
		const CFG = localStorage.getItem("READER_DATASAVER");
		val = CFG != null ? CFG == "true" : true;
	}
	localStorage.setItem("READER_DATASAVER", val);
	return val;
}

export class DataSaverSetting extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dataSaver: setDataSaver(null)
		};
	}

	change(val) {
		setDataSaver(val);
		Array.from(document.getElementsByClassName("reader-image")).forEach((e) => {
			const source = val ? e.getAttribute("datasaver-src") : e.getAttribute("data-src");
			const loaded = e.complete;
			if (!loaded) {
				e.setAttribute("src", source);
			}
		})
		this.setState({
			dataSaver: val
		});
	}

	render() {
		return (
			<Row className="form-group">
				<label className="col-sm-4 col-form-label">
					Data saver <a href="/thread/252554"><span className="fas fa-info-circle fa-fw" title="More information" /></a>
				</label>
				<Col>
					<Row>
						<ToggleButtonGroup 
							type="radio" 
							name="datasaver-option"
							defaultValue={this.state.dataSaver}
						>
							{/*TODO: Standardize this and try radio buttons */}
							<Button 
								variant="secondary" 
								className="col px-2"
								value={false}
								active={this.state.dataSaver == false}
								onClick={(e) => this.change(false)}
							>
								Original images
							</Button>
							<Button 
								variant="secondary" 
								className="col px-2"
								value={true}
								active={this.state.dataSaver == true}
								onClick={(e) => this.change(true)}
							>
								Compressed images
							</Button>
						</ToggleButtonGroup>
					</Row>
				</Col>
			</Row>
		)
	}
}

class SettingsModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false
		};
	}

	openModal = () => this.setState({ isOpen: true });
	closeModal = () => this.setState({ isOpen: false });

	componentDidMount() {
	}

	_setDisplayType(val) {
		if (val == null) {
			const CFG = localStorage.getItem("READER_DISPLAYTYPE");
			val = CFG != null ? CFG : "single-page";
		}
		localStorage.setItem("READER_DISPLAYTYPE", val);
		if (this.props.renderer != null && this.props.renderer.current != null) {
			this.props.renderer.current.setRenderer(val);
		}
		return val;
	}
	setDisplayType(val) {
		const reader_ref = document.getElementsByClassName("reader")[0];
	
		const single_page = document.getElementsByClassName("show-single-page")[0];
		const double_page = document.getElementsByClassName("show-double-page")[0];
		const long_strip  = document.getElementsByClassName("show-long-strip")[0];
	
		const r_single_page = getElementByXpath("//button[@data-setting='renderingMode' and @data-value='1']");
		const r_double_page = getElementByXpath("//button[@data-setting='renderingMode' and @data-value='2']");
		const r_long_strip  = getElementByXpath("//button[@data-setting='renderingMode' and @data-value='3']");

		if (val == "double-page") {
			return;
		}

		single_page.classList.add("d-none");
		double_page.classList.add("d-none");
		long_strip.classList.add("d-none");
	
		r_single_page.classList.remove("active");
		r_double_page.classList.remove("active");
		r_long_strip.classList.remove("active");
	
		if (val == "single-page") {
			r_single_page.classList.add("active");
			single_page.classList.remove("d-none");
			this._setDisplayType(val);
		}
		/*if (val == "double-page") {
			r_double_page.classList.add("active");
			double_page.classList.remove("d-none");
			this._setDisplayType(val);
		}*/
		if (val == "long-strip") {
			r_long_strip.classList.add("active");
			long_strip.classList.remove("d-none");
			this._setDisplayType(val);
		}
	}
	scrollDisplayType() {
		const reader_ref = document.getElementsByClassName("reader")[0];

		const single_page = document.getElementsByClassName("show-single-page")[0];
		const double_page = document.getElementsByClassName("show-double-page")[0];
		const long_strip = document.getElementsByClassName("show-long-strip")[0];

		if (!single_page.classList.contains("d-none")) {
			long_strip.classList.remove("d-none");
			single_page.classList.add("d-none");

			this.setDisplayType("long-strip");
		}
		/*if (!double_page.classList.contains("d-none")) {
		}*/
		else if (!long_strip.classList.contains("d-none")) {
			long_strip.classList.add("d-none");
			single_page.classList.remove("d-none");

			this.setDisplayType("single-page");
		}
	}

	render() {
		return (
			{/* settings modal */},
			<Modal 
				id="modal-settings"
				show={this.state.isOpen} 
				onHide={this.closeModal} 
				animation={true}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>Reader settings</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Container>
						<Row className="form-group">
							<Col>
								<Form.Check
									label="Display advanced (*) settings"
									onChange={(e) => setAdvancedSettings(e.target.checked)}
								/>
							</Col>
						</Row>
						<hr />
						<h5><span className='fas fa-book-open fa-fw' aria-hidden='true' title=''></span> Display settings</h5>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Fit display to</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="displayFit" className="btn btn-default btn-secondary col px-2">Container</button>
									<button type="button" data-value="2" data-setting="displayFit" className="btn btn-default btn-secondary col px-2">Width</button>
									<button type="button" data-value="3" data-setting="displayFit" className="btn btn-default btn-secondary col px-2">Height</button>
									<button type="button" data-value="4" data-setting="displayFit" className="btn btn-default btn-secondary col px-2">No resize</button>
								</div>
							</div>
						</div>
						<div className="form-group row advanced">
							<label className="col-sm-4 col-form-label">Maximum container width</label>
							<div className="col my-auto input-group">
								<input data-setting="containerWidth" className="form-control" type="number" min="0" step="50" placeholder="Leave empty for 100%" />
								<div className="input-group-append">
									<span className="input-group-text">pixels</span>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Page rendering</label>
							<div className="col">
								<div className="row">
									<Button 
										type="button" 
										variant="secondary" 
										data-value="1" 
										data-setting="renderingMode" 
										className="col px-2" 
										active={this._setDisplayType(null) == "single-page"} 
										onClick={(e) => this.setDisplayType("single-page")}>
											Single
									</Button>
									<Button 
										type="button" 
										variant="secondary" 
										data-value="2" 
										data-setting="renderingMode" 
										className="col px-2" 
										active={this._setDisplayType(null) == "double-page"} 
										onClick={(e) => this.setDisplayType("double-page")}>
											Double
									</Button>
									<Button 
										type="button" 
										variant="secondary" 
										data-value="3" 
										data-setting="renderingMode" 
										className="col px-2" 
										active={this._setDisplayType(null) == "long-strip"} 
										onClick={(e) => this.setDisplayType("long-strip" )}>
											Long strip
									</Button>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Direction</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="direction" className="btn btn-default btn-secondary col px-2">Left to right</button>
									<button type="button" data-value="2" data-setting="direction" className="btn btn-default btn-secondary col px-2">Right to left</button>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Language-based chapter filtering</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="0" data-setting="restrictChLang" className="btn btn-default btn-secondary col px-2">Show all languages</button>
									<button type="button" data-value="1" data-setting="restrictChLang" className="btn btn-default btn-secondary col px-2">Hide other languages</button>
								</div>
							</div>
						</div>
						<hr />
						<h5><span className='fas fa-columns fa-fw' aria-hidden='true' title=''></span> Layout settings</h5>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Header</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="0" data-setting="hideHeader" className="btn btn-default btn-secondary col px-2">Visible</button>
									<button type="button" data-value="1" data-setting="hideHeader" className="btn btn-default btn-secondary col px-2">Hidden</button>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Sidebar</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="0" data-setting="hideSidebar" className="btn btn-default btn-secondary col px-2">Visible</button>
									<button type="button" data-value="1" data-setting="hideSidebar" className="btn btn-default btn-secondary col px-2">Hidden</button>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Page bar</label>
							<div className="col d-none d-lg-block">
								<div className="row">
									<button type="button" data-value="0" data-setting="hidePagebar" className="btn btn-default btn-secondary col px-2">Visible</button>
									<button type="button" data-value="1" data-setting="hidePagebar" className="btn btn-default btn-secondary col px-2">Hidden</button>
								</div>
							</div>
							<div className="col d-lg-none">
								<div className="row">
									<button type="button" disabled className="btn btn-default btn-secondary col px-2">Hidden on the mobile layout</button>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Sidebar collapser style</label>
							<div className="col d-none d-lg-block">
								<div className="row">
									<button type="button" data-value="0" data-setting="collapserStyle" className="btn btn-default btn-secondary col px-2">Corner button</button>
									<button type="button" data-value="1" data-setting="collapserStyle" className="btn btn-default btn-secondary col px-2">On-hover bar</button>
								</div>
							</div>
							<div className="col d-lg-none">
								<div className="row">
									<button type="button" disabled className="btn btn-default btn-secondary col px-2">Hidden on the mobile layout</button>
								</div>
							</div>
						</div>
						<div className="form-group row advanced">
							<label className="col-sm-4 col-form-label">Chapter dropdown titles</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="showDropdownTitles" className="btn btn-default btn-secondary col px-2">Visible</button>
									<button type="button" data-value="0" data-setting="showDropdownTitles" className="btn btn-default btn-secondary col px-2">Hidden</button>
								</div>
							</div>
						</div>
						<hr />
						<h5><span className='fas fa-hand-pointer fa-fw' aria-hidden='true' title=''></span> Input settings</h5>
						<div className="row form-group">
							<label className="col-sm-4 col-form-label">Hide cursor over images</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="hideCursor" className="btn btn-default btn-secondary col px-2">Enabled</button>
									<button type="button" data-value="0" data-setting="hideCursor" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>
						<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">Tap/click target area</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="tapTargetArea" className="btn btn-default btn-secondary col px-2">Entire container</button>
									<button type="button" data-value="0" data-setting="tapTargetArea" className="btn btn-default btn-secondary col px-2">Images only</button>
								</div>
							</div>
						</div>
						<div className="row form-group">
							<label className="col-sm-4 col-form-label">Turn page by tapping/clicking</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="pageTapTurn" className="btn btn-default btn-secondary col px-2">Directional turn</button>
									<button type="button" data-value="2" data-setting="pageTapTurn" className="btn btn-default btn-secondary col px-2">Always turn forward</button>
									<button type="button" data-value="0" data-setting="pageTapTurn" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>
						<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">Turn page in long strip mode</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="pageTurnLongStrip" className="btn btn-default btn-secondary col px-2">Enabled</button>
									<button type="button" data-value="0" data-setting="pageTurnLongStrip" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>
						<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">Turn page by vertical scrolling</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="pageWheelTurn" className="btn btn-default btn-secondary col px-2">Mouse wheel + keys</button>
									<button type="button" data-value="2" data-setting="pageWheelTurn" className="btn btn-default btn-secondary col px-2">Mouse wheel</button>
									<button type="button" data-value="0" data-setting="pageWheelTurn" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>
						<div className="row form-group">
							<label className="col-sm-4 col-form-label">Keyboard scrolling method</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="2" data-setting="scrollingMethod" className="btn btn-default btn-secondary col px-2">Browser native</button>
									<button type="button" data-value="0" data-setting="scrollingMethod" className="btn btn-default btn-secondary col px-2">Browser native + WASD</button>
									<button type="button" data-value="1" data-setting="scrollingMethod" className="btn btn-default btn-secondary col px-2">Screen portion</button>
								</div>
							</div>
						</div>
						<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">Touchscreen swipe direction</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="0" data-setting="swipeDirection" className="btn btn-default btn-secondary col px-2">Normal</button>
									<button type="button" data-value="1" data-setting="swipeDirection" className="btn btn-default btn-secondary col px-2">Inverted</button>
								</div>
							</div>
						</div>
						<div className="row form-group">
							<label className="col-sm-4 col-form-label">Touchscreen swipe sensitivity</label>
							<div className="col my-auto">
								<select className="form-control" data-setting="swipeSensitivity">
									<option value="0">Off</option>
									<option value="1">Very low</option>
									<option value="2">Low</option>
									<option value="3">Normal</option>
									<option value="4">High</option>
									<option value="5">Very high</option>
								</select>
							</div>
						</div>
						<hr />
						<h5><span className='fas fa-folder-open fa-fw' aria-hidden='true' title=''></span> Other settings</h5>
						<div className="row form-group mb-1">
							<label className="col-sm-4 col-form-label">Preload images (0 to <span className="preload-max-value">5</span>)</label>
							<div className="col my-auto">
								<input data-setting="preloadPages" className="form-control" type="number" min="0" max="5" placeholder="The amount of images" />
							</div>
						</div>
						<div className="row form-group text-right">
							<small className="col">Note: Chapters with images loaded via MD@H will always be fully preloaded.</small>
						</div>
						<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">Preload this entire chapter</label>
							<div className="col">
								<div className="row">
									<button type="button" id="preload-all" className="btn btn-default btn-secondary col px-2" disabled>Logged in users only</button>
								</div>
							</div>
						</div>
						{/*<div className="row form-group">
							<label className="col-sm-4 col-form-label">Warn about chapter gaps</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="gapWarning" className="btn btn-default btn-secondary col px-2">Enabled</button>
									<button type="button" data-value="0" data-setting="gapWarning" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>*/}
						<DataSaverSetting />
						{/*<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">[BETA] Recommendations</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="betaRecommendations" className="btn btn-default btn-secondary col px-2">Enabled</button>
									<button type="button" data-value="0" data-setting="betaRecommendations" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>*/}
						<hr />
						<div>
							<h4><span className='fas fa-keyboard fa-fw' aria-hidden='true' title=''></span> Keyboard shortcuts</h4>
							<p>
								<kbd>^</kbd> = shift key
								<br />
								<kbd>^f</kbd> = shift + f
							</p>
							<ul className="list-unstyled container">
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>f</kbd>
									</div>
									<div className="col pl-2">Toggle between fit display to container and width</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^f</kbd>
									</div>
									<div className="col pl-2">Toggle between fit display to height and no resize</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>g</kbd>
										<kbd>^g</kbd>
									</div>
									<div className="col pl-2">Toggle between the page rendering options</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>h</kbd>
									</div>
									<div className="col pl-2">Toggle between the reader directions</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>r</kbd>
									</div>
									<div className="col pl-2">Toggle header visibility</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>t</kbd>
									</div>
									<div className="col pl-2">Toggle side bar visibility</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>y</kbd>
									</div>
									<div className="col pl-2">Toggle page bar visibility</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^r</kbd>
										<kbd>^t</kbd>
										<kbd>^y</kbd>
									</div>
									<div className="col pl-2">Show/hide all header, side bar and page bar</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^m</kbd>
									</div>
									<div className="col pl-2">Exit to the manga's main page</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^k</kbd>
									</div>
									<div className="col pl-2">Exit to the chapter's comments</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^q</kbd>
										<kbd>^e</kbd>
									</div>
									<div className="col pl-2">Go to the next/previous chapter depending on the direction</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>&larr;&uarr;&darr;&rarr;</kbd>
										<kbd>wasd</kbd>
									</div>
									<div className="col pl-2">Scroll the screen and turn pages</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^&larr;</kbd>
										<kbd>^&rarr;</kbd>
										<kbd>^a</kbd>
										<kbd>^d</kbd>
									</div>
									<div className="col pl-2">Shift by a single page in double page mode</div>
								</li>
							</ul>
						</div>
					</Container>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={this.closeModal}>
						<span className='fas fa-undo fa-fw' aria-hidden='true' title='' />
						&nbsp;
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		)
	}
}

const ERIGHT = 0;
const ELEFT = 1;

class SinglePageRender {
	constructor(props) {
		this.props = props;
		this.page = this.pageCurrent();
		this.direction = props.dir != null ? props.dir : ERIGHT;
		this.distance = props.distance != null ? props.distance : 4;
		this.onReadCalled = false;
	}
	init() {
		this._setRenderer("single-page");
		this.pageCurrentSet(this.page);
	}
	exit() {}
	_getReader() {
		return document.getElementsByClassName("reader")[0];
	}
	_setRenderer(data) {
		console.log("_setRenderer", data);
		this._getReader().setAttribute("data-renderer", data);
	}
	getRenderer() {
		return this._getReader().getAttribute("data-renderer");
	}
	pageCurrent() {
		const element = getElementByXpath("//div[contains(@class,'reader-images')]");
		if (element) {
			return parseInt(element.getAttribute("page"));
		}
		return 0;
	}
	pageCurrentSet(i) {
		const pages = this.pageAll();

		getElementByXpath("//div[contains(@class,'reader-images')]").setAttribute("page", i);
		Array.from(document.getElementsByClassName("current-page")).forEach((e) => e.innerHTML = i+1);
		document.getElementById("jump-page").value = i;

		Array.from(document.getElementsByClassName("trail")[0].childNodes).forEach((n,idx) => {
			n.classList.remove("thumb");
			if (idx == i) {
				n.classList.add("thumb");
			}
		})

		if ((i+1) >= Math.round(pages.length * 0.75)) {
			if (!this.onReadCalled) {
				console.log("pageCurrent", "onRead");
				this.onReadCalled = true;
				this.props.onRead();
			}
		}

		this.load();
	}
	pageAll() {
		return document.getElementsByClassName("reader-image");
	}
	load() {
		console.log("load");
		const page = this.pageCurrent();
		const pages = this.pageAll();
		const preload = this.distance+1;

		Array.from(pages).forEach((e,idx) => {
			if (idx-preload < page && page < idx+preload) {
				e.setAttribute("loading", "eager");
			} else {
				e.setAttribute("loading", "lazy");
			}

			if (idx == page) {
				e.classList.remove("d-none");
			} else {
				e.classList.add("d-none");
			}
		});
	}
	pageClick(e) {
		const element = e.target;
		var rect = element.getBoundingClientRect();
		const width = rect.right - rect.left;
		const middle = rect.left + (width / 2);

		const clicked_right = e.clientX > middle;

		if (clicked_right) {
			this.pageNext(e);
		} else {
			this.pagePrev(e);
		}
	}
	pageSet(idx) {
		const page = this.pageCurrent();
		const pages = this.pageAll();

		pages[page].classList.add("d-none");
		pages[idx].classList.remove("d-none");
		this.pageCurrentSet(idx);
	}
	//TODO: Next chapter
	pageNext(e) {
		const element = e.target;
		const page = this.pageCurrent();
		const pages = this.pageAll();

		if ((page+1) < pages.length) {
			pages[page].classList.add("d-none");
			pages[page+1].classList.remove("d-none");
			this.pageCurrentSet(page+1);
		} else {
			this.props.onEnd();
		}
	}
	pagePrev(e) {
		const element = e.target;
		const page = this.pageCurrent();
		const pages = this.pageAll();

		if (page > 0) {
			pages[page].classList.add("d-none");
			pages[page-1].classList.remove("d-none");
			this.pageCurrentSet(page-1);
		} else {
			this.props.onBegin();
		}
	}
	render() {
		return (<React.Fragment></React.Fragment>)
	}
}
class LongStripRender extends SinglePageRender {
	init() {
		this._setRenderer("long-strip");
		this.pageCurrentSet(this.page);
		this.load();
		this.pageScroll(false);

		const render_window = document.getElementsByClassName("reader-images")[0];
		this.funnyfunc = (e) => this.scrollEvent(e);
		render_window.addEventListener("scroll", this.funnyfunc, false);
	}
	exit() {
		const render_window = document.getElementsByClassName("reader-images")[0];
		render_window.removeEventListener("scroll", this.funnyfunc, false);
	}

	scrollEvent(e) {
		var visible = null;
		Array.from(this.pageAll()).forEach((e) => {
			if (checkVisible(e)) { //TODO: Check middle
				visible = e.getAttribute("page");
			}
		});
		if (visible) {
			visible = parseInt(visible)
			this.pageCurrentSet(visible);
			//TODO: Load when near
		}
	}

	load() {
		const pages = this.pageAll();
		Array.from(pages).forEach((e,idx) => {
			e.setAttribute("loading", "lazy");
			e.classList.remove("d-none");
		});
	}
	pageScroll(smooth=true) {
		const page = this.pageCurrent();
		const pages = this.pageAll();

		if (smooth) {
			pages[page].scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
		} else {
			pages[page].scrollIntoView();
		}
	}
	pageNext(e) {
		const page = this.pageCurrent();
		const pages = this.pageAll();

		if ((page+1) < pages.length) {
			super.pageCurrentSet(page+1);
			this.pageScroll();
		}
	}
	pagePrev(e) {
		const page = this.pageCurrent();
		const pages = this.pageAll();

		if (page > 0) {
			super.pageCurrentSet(page-1);
			this.pageScroll();
		}
	}
}

//TODO: Unify this better
class PageRenderer extends React.Component {
	constructor(props) {
		super(props);
		/*
			id={this.state.chapter.getId()}
			settings={this.changeChild}
			onBegin={() => this.prevChapter(null)}
			onEnd={() => this.nextChapter(null)}
			onRead={() => {user != null && API.readChapter(ch.getId())}}
		*/

		this.state = {
			pages: null
		}
		this.child = React.createRef();
		this.refreshCounter = 0;
		this.timer = null;
		this.renderer = null;
	}

	fetchPages(idx) {
		const counter = this.refreshCounter;

		if (idx == counter) {
			//const waiter = idx == 0 ? 0 : Math.min(200*Math.pow(1.7, counter), 5000);
			const waiter = idx > 0 ? axios.exponentialDelay(idx) : 0;
			console.log("fetchPages: ", counter, waiter);

			this.refreshCounter += 1;
			this.timer = setTimeout(() => {
				//TODO: Detect failure
				API.chapterPages(this.props.id).then((c) => {
					if (c == null) {
						this.fetchPages(counter+1);
					} else {
						this.setState({
							pages: c
						});
						this.setRenderer("single-page");
					}
				});
			}, waiter); //Exponential backoff
		}
	}

	componentDidMount() {
		this.fetchPages(0);
	}

	componentWillUnmount() {
		if (this.renderer != null) {
			this.renderer.exit();
		}
		clearTimeout(this.timer);
	}

	renderRef() {
		return this.renderer;
	}
	componentDidUpdate(prevProps) {
		if (prevProps.id != this.props.id) {
			this.fetchPages(this.refreshCounter);
		}
	}

	//TODO: I hate this design, construct a proper architecture
	setRenderer(val) {
		const config = {
			onBegin: this.props.onBegin,
			onEnd: this.props.onEnd,
			onRead: this.props.onRead
		}

		if (val == "single-page") {
			if (this.renderer != null) {
				this.renderer.exit();
			}
			const rend = new SinglePageRender(config);
			rend.init();
			this.renderer = rend;
		}
		if (val == "double-page") {

		}
		if (val == "long-strip") {
			if (this.renderer != null) {
				this.renderer.exit();
			}
			const rend = new LongStripRender(config);
			rend.init();
			this.renderer = rend;
		}
	}

	render() {
		const pages = this.state.pages;

		/*
		document.getElementsByClassName("reader")[0].setAttribute("data-renderer", "fit-both");
		document.getElementsByClassName("reader")[0].setAttribute("data-direction", "ltr");
		document.getElementsByClassName("reader")[0].setAttribute("renderer", "single-page");
		*/

		const renderPages = () => {
			if (pages == null) {
				return (
					<div className="m-5 d-flex align-items-center justify-content-center" style={{color: "#fff", textShadow: "0 0 7px rgba(0,0,0,0.5)"}}>
						<span className="fas fa-circle-notch fa-spin position-absolute" style={{opacity: "0.5", fontSize: "7em"}} />
						<span className="loading-page-number" style={{fontSize: "2em"}}></span>
					</div>
				)
			}

			var dataTbl = pages.chapter.data;
			var dataSaverTbl = pages.chapter.dataSaver;

			return (
				dataTbl.map((_, idx) => {
					const displayed = (idx != (this.renderer != null ? this.renderer.pageCurrent() : 0)) ? "d-none" : "";
					const loading = idx < 5 ? "eager" : "lazy";
					const full_img = `${pages.baseUrl}/data/${pages.chapter.hash}/${dataTbl[idx]}`;
					const saver_img = `${pages.baseUrl}/data-saver/${pages.chapter.hash}/${dataSaverTbl[idx]}`;
					const img_url = setDataSaver(null) ? saver_img : full_img;
					const refreshidx = this.refreshCounter;

					return (
						<img
							className={`noselect nodrag cursor-pointer reader-image ${displayed}`}
							data-src={full_img}
							datasaver-src={saver_img}
							src={img_url}
							loading={loading}
							page={idx}
							onError={(e) => this.fetchPages(parseInt(refreshidx)) }
							onLoad={(e) => {
								const bar = Array.from(document.getElementsByClassName("trail")[0].childNodes);
								bar[idx].classList.add("loaded");
							}}
						/>
					)
				})
			)
		}

		return (
			{/* reader main */},
			<Container className="reader-main col row no-gutters flex-column flex-nowrap noselect" style={{"flex":"1"}}>
				<noscript>
					<div className="alert alert-danger text-center">
						JavaScript is required for this reader to work.
					</div>
				</noscript>
				<div className="reader-goto-top d-flex d-lg-none justify-content-center align-items-center fade cursor-pointer">
					<span className="fas fa-angle-up"></span>
				</div>
				<div 
					className="reader-images row no-gutters flex-nowrap text-center cursor-pointer directional"
					onClick={(e) => this.renderRef().pageClick(e)}
					page={0}
				>
					{renderPages()}
				</div>
				<div className="reader-load-icon">
					<span className="fas fa-circle-notch fa-spin" aria-hidden="true"></span>
				</div>
				<div className="reader-page-bar col-auto d-none d-lg-flex directional">
					<div className="track cursor-pointer row no-gutters">
						<div className="trail position-absolute h-100" style={{display: "flex"}}>
							{Array.from(Array(pages != null ? pages.chapter.data.length : 0).keys()).map((idx) => {
								const _class = idx == 0 ? "thumb" : "";
								//notch for loading anim?

								//TODO: Better aim?
								return (
									<div 
										className={`${_class} notch h-100 w-100`}
										onClick={(e) => {
											this.renderRef().pageSet(idx)
										}}
									>

									</div>
								)
							})}
						</div>
						<div className="notches row no-gutters h-100 w-100 directional"></div>
						<div className="notch-display col-auto m-auto px-3 py-1 noevents"></div>
					</div>
				</div>
			</Container>
		)
	}
}

export class ChapterDisplay extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isMobile: this.isMobile(),
			chapter: null,
			chapters: []
		};
		this.changeChild=React.createRef();
		this.changeRender=React.createRef();
	}

	static contextType = UserContext;

	hasChapter() {
		const c = this.state.chapter;
		if (c != null && c.data.length > 0) {
			return c.data[0];
		}
		return null;
	}

	scanDisplay() {
		const chapter = this.hasChapter();

		if (chapter == null) {
			return (
				<li>
					<span className="rounded flag flag-unknown mr-1"></span>
					&nbsp;
					<a></a>
				</li>
			)
		}

		var scangroup = chapter.GetRelationship("scanlation_group");
		if (scangroup != null && scangroup.length > 0) {
			scangroup = scangroup[0];
			return (
				<li>
					<span className={`rounded flag flag-${scangroup.getLang()} mr-1`}></span>
					&nbsp;
					<Link to={scangroup.getUrl()} style={{fontWeight: "bold"}}>{scangroup.getName()}</Link>
				</li>
			)
		}

		var scanuser = chapter.GetRelationship("user");
		if (scanuser != null && scanuser.length > 0) {
			scanuser = scanuser[0];
			return (
				<li>
					<span className="rounded flag flag-en mr-1"></span>
					&nbsp;
					<Link to={scanuser.getUrl()} style={{fontWeight: "bold"}}>{scanuser.getName()}</Link>
				</li>
			)
		}

		return (
			<li>
				<span className="rounded flag flag-unknown mr-1"></span>
				&nbsp;
				<a></a>
			</li>
		)
	}

	readerControls(handleShow) {
		const chapter = this.hasChapter();
		var c_title = "";
		var m_title = "";
		var m_href = "";
		const reader = document.getElementsByClassName("reader")[0];

		if (chapter != null) {
			const manga = chapter.GetRelationship("manga")[0];

			c_title = chapter.getTitle();
			m_title = manga.getTitle();
			m_href = manga.getUrl();
		}

		return (
			{/* reader controls */},
			<Container className="reader-controls-container p-0">
				<Row className="reader-controls-wrapper bg-reader-controls no-gutters flex-nowrap" style={{"zIndex": "1"}}>
					<div id="reader-controls-collapser-bar" className="reader-controls-collapser col-auto align-items-center justify-content-center cursor-pointer" onClick={(e) => {
						if (reader.classList.contains("hide-sidebar")) {
							reader.classList.remove("hide-sidebar");
						} else {
							reader.classList.add("hide-sidebar");
						}
					}}>
						<span className="fas fa-caret-right fa-fw arrow-link" aria-hidden="true" title="Collapse menu" style={{
							position: "relative",
							top: "50%",
							marginLeft: "auto",
							marginRight: "auto",
							display: "unset"
						}} />
					</div>
					<Row className="reader-controls col row no-gutters flex-column flex-nowrap">
						<Col className="reader-controls-title col-auto text-center px-2 pb-2">
							<Row className="no-gutters">
								<div id="reader-controls-collapser-button" className="reader-controls-collapser col-auto justify-content-center cursor-pointer">
									<span className="fas fa-caret-right fa-fw arrow-link" aria-hidden="true" title="Collapse menu"></span>
								</div>
								<div className="col pt-2 manga-title-col" style={{"fontSize":"1.25em"}}>
									<span className={`rounded flag flag-${chapter != null && chapter.getLang()}`}></span>
									&nbsp;
									<Link to={m_href} className="manga-link" data-action="url" title={m_title}>{m_title}</Link>
									{/* Remove d-none if H */}
									<span className="chapter-tag-h badge badge-danger d-none">H</span>
									{/* Remove d-none if doujinshi */}
									<span className="chapter-tag-doujinshi badge badge-primary d-none" style={{"backgroundColor":"#735ea5"}}>Dj</span>
								</div>
							</Row>
							<div className="d-none d-lg-block">
								<span className="chapter-title" data-chapter-id="">{c_title}</span> 
									{/* Remove d-none if end-chapter */}
								<span className="chapter-tag-end badge badge-primary d-none">END</span>
							</div>
						</Col>
						<Col className="reader-controls-chapters col-auto row no-gutters align-items-center">
							<a className="chapter-link-left col-auto arrow-link" title="" href="" data-action="chapter" data-chapter="" onClick={(e) => { e.preventDefault(); this.prevChapter(e); }}>
								<span className="fas fa-angle-left fa-fw" aria-hidden="true"></span>
							</a>
							<div className="col py-2">
								<select value={chapter != null && chapter.getId()} className="form-control col" id="jump-chapter" onChange={(e) => { e.preventDefault(); this.jumpChapter(e); }}>
									{this.state.chapters}
								</select>
							</div>
							<a className="chapter-link-right col-auto arrow-link" title="" href="" data-action="chapter" data-chapter="" onClick={(e) => { e.preventDefault(); this.nextChapter(e); }}>
								<span className="fas fa-angle-right fa-fw" aria-hidden="true"></span>
							</a>
							<div className="col-auto py-2 pr-2 d-lg-none">
								<select className="form-control" id="jump-page" onChange={(e) => {
									this.renderer.pageSet(e.target.value);
								}}>
									{Array.from(Array(chapter != null ? chapter.attributes.pages : 0).keys()).map((idx) => {
										return (<option value={idx}>Page {idx+1}</option>)
									})}
								</select>
							</div>
						</Col>
						<Col className="reader-controls-groups col-auto row no-gutters">
							<ul className="col list-unstyled p-2 m-0 chapter-link">
								{this.scanDisplay()}
							</ul>
						</Col>
						<Col className="reader-controls-unsupported col-auto row no-gutters p-2 text-danger d-none"></Col>
						<Col className="reader-controls-actions col-auto row no-gutters p-1">
							<div className="col row no-gutters" style={{"minWidth":"120px"}}>
								{/* TODO: Open modal */}
								<a title="Reader settings" className="btn btn-secondary col m-1 px-1" role="button" onClick={() => this.changeChild.current.openModal()}>
									<span className="fas fa-cog fa-fw"></span> Reader settings
								</a>
								{/*<a title="Recommendations" className="btn btn-secondary col m-1 px-1 d-none" role="button" id="recommendations-button">
									<span className="fas fa-thumbs-up fa-fw"></span> Recommendations
								</a>*/}
								<div className="w-100 d-block d-lg-block"></div>
								{/* <a title="Hide header" className="btn btn-secondary col m-1" role="button" id="hide-header-button">
									<span className="far fa-window-maximize fa-fw"></span>
								</a>
								<a title="Fullscreen" className="btn btn-secondary col m-1" role="button" id="fullscreen-button">
								<span className="fa fa-arrows-alt fa-fw"></span>
								</a>
								<a title="Comment" data-action="url" className="btn btn-secondary col m-1" role="button" id="comment-button">
									<strong className="comment-amount" style={{"fontSize":"0.9em"}}></strong> <span className="far fa-comments fa-fw"></span>
								</a>
								<a title="Report" className="btn btn-secondary col m-1" role="button" id="report-button" data-toggle="modal" data-target="#modal-report">
									<span className="fas fa-flag fa-fw"></span>
								</a>*/}
								<div className="w-100 d-block d-lg-block"></div>
							</div>
						</Col>
						<Col className="reader-controls-mode col-auto d-lg-flex d-none flex-column align-items-start" style={{"flex":"0 1 auto", "overflow":"hidden"}}>
							<div className="reader-controls-mode-display-fit w-100 cursor-pointer pt-2 px-2" onClick={(e) => this.imgFit["scroll"]()}>
								<kbd>^f</kbd>
								<span className="fas fa-compress fa-fw" aria-hidden="true" title="Display fit"></span>
								<span className="show-no-resize d-none">No resize</span>
								<span className="show-fit-both">Fit to container</span>
								<span className="show-fit-height d-none">Fit height</span>
								<span className="show-fit-width d-none">Fit width</span>
							</div>
							<div className="reader-controls-mode-rendering w-100 cursor-pointer px-2"  onClick={(e) => this.changeChild.current.scrollDisplayType()}>
								<kbd>&nbsp;g</kbd>
								<span className="fas fa-book fa-fw" aria-hidden="true" title="Reader mode"></span>
								<span className="show-single-page">Single page</span>
								<span className="show-double-page d-none">Double page</span>
								<span className="show-long-strip d-none">Long strip</span>
								{/*<span className="show-recommendations">Recommendations</span>
								<span className="show-alert">Alert</span>*/}
							</div>
							<div className="reader-controls-mode-direction w-100 cursor-pointer pb-2 px-2">
								<kbd>&nbsp;h</kbd>
								{/* PRE DISABLED <span className="fas fa-exchange-alt fa-fw" aria-hidden="true" title="Direction"></span>
								<span className="direction-ltr">Left to right</span>
								<span className="direction-rtl">Right to left</span> */}
								<span className="show-direction-ltr">
									<span className="fas fa-long-arrow-alt-right fa-fw" aria-hidden="true" title="Direction"></span> Left to right
								</span>
								<span className="show-direction-rtl d-none">
									<span className="fas fa-long-arrow-alt-left fa-fw" aria-hidden="true" title="Direction"></span> Right to left
								</span>
							</div>
						</Col>
						<Col className="reader-controls-footer col-auto mt-auto d-none d-lg-flex justify-content-center" style={{"flex":"0 1 auto", "overflow":"hidden"}}>
							<div className="text-muted text-center text-truncate row flex-wrap justify-content-center p-2 no-gutters">
								<span className="col-auto mx-1">©2021</span>
								<a href="/" className="col-auto mx-1">MangaDex</a>
							</div>
						</Col>
						<Col className="reader-controls-pages col-auto d-none d-lg-flex row no-gutters align-items-center">
							<a className="page-link-left col-auto arrow-link" href="" data-action="page" data-direction="left" data-by="1" onClick={(e) => { e.preventDefault(); this.renderer.pagePrev(e); }}>
								<span className="fas fa-angle-left fa-fw" aria-hidden="true" title="Turn page left"></span>
							</a>
							<div className="col text-center reader-controls-page-text cursor-pointer">
								Page <span className="current-page">1</span> / <span className="total-pages">{chapter != null ? chapter.attributes.pages : 0}</span>
							</div>
							<div className="col text-center reader-controls-page-recommendations">
								Recommendations
							</div>
							<a className="page-link-right col-auto arrow-link" href="" data-action="page" data-direction="right" data-by="1" onClick={(e) => { e.preventDefault(); this.renderer.pageNext(e); }}>
								<span className="fas fa-angle-right fa-fw" aria-hidden="true" title="Turn page right"></span>
							</a>
						</Col>
					</Row>
				</Row>
			</Container>
		)
	}

	imgFit = {
		"by": (t) => {
			const reader_ref = document.getElementsByClassName("reader")[0];
			reader_ref.classList.remove("fit-horizontal");
			reader_ref.classList.remove("fit-vertical");

			const no_resize = document.getElementsByClassName("show-no-resize")[0];
			const fit_both = document.getElementsByClassName("show-fit-both")[0];
			const fit_height = document.getElementsByClassName("show-fit-height")[0];
			const fit_width = document.getElementsByClassName("show-fit-width")[0];
			no_resize.classList.add("d-none");
			fit_both.classList.add("d-none");
			fit_height.classList.add("d-none");
			fit_width.classList.add("d-none");

			console.log(t);
			if (t == "both") {
				fit_both.classList.remove("d-none");

				reader_ref.classList.add("fit-horizontal");
				reader_ref.classList.add("fit-vertical");
			} else if (t == "height") {
				fit_height.classList.remove("d-none");
	
				reader_ref.classList.add("fit-vertical");
			} else if (t == "width") {
				fit_width.classList.remove("d-none");
	
				reader_ref.classList.add("fit-horizontal");
			} else {
				no_resize.classList.remove("d-none");
			}
		},
		"scroll": (e) => {
			/*
				<span className="show-no-resize">No resize</span>
				<span className="show-fit-both d-none">Fit to container</span>
				<span className="show-fit-height d-none">Fit height</span>
				<span className="show-fit-width d-none">Fit width</span>
			*/
			const no_resize = document.getElementsByClassName("show-no-resize")[0];
			const fit_both = document.getElementsByClassName("show-fit-both")[0];
			const fit_height = document.getElementsByClassName("show-fit-height")[0];
			const fit_width = document.getElementsByClassName("show-fit-width")[0];

			if (!no_resize.classList.contains("d-none")) { //Fit-both
				this.imgFit["by"]("both");
			} else if (!fit_both.classList.contains("d-none")) { //Fit-height
				this.imgFit["by"]("height");
			} else if (!fit_height.classList.contains("d-none")) { //Fit-width
				this.imgFit["by"]("width");
			} else if (!fit_width.classList.contains("d-none")) { //Fit-none
				this.imgFit["by"]("none");
			}
		},
	}

	isMobile() {
		return window.innerWidth < 992;
	}

	cvTitle(volume, chapter) {
		var str = "";
		if (volume != "none") {
			str += `Volume. ${volume} `;
		}
		str += `Ch. ${chapter}`;

		return str;
	}

	_jumpChapter(id) {
		console.log("jump", id);
		return this.props.nav(`/chapter/${id}`);
	}
	jumpChapter(e) {
		return this._jumpChapter(e.target.value);
	}
	backToManga() {
		return this.props.nav(this.hasChapter().GetRelationship("manga")[0].getUrl());
	}
	nextChapter(e) {
		const chaps = Array.from(document.getElementById("jump-chapter").childNodes);
		const chap = chaps.filter((c) => c.value == this.props.id)[0];
		const chap_idx = chaps.indexOf(chap);
		const chap_nextidx = chap_idx + 1;
		if (chap_nextidx < chaps.length) {
			return this._jumpChapter(chaps[chap_nextidx].value);
		} else {
			this.backToManga();
		}
	}
	prevChapter(e) {
		const chaps = Array.from(document.getElementById("jump-chapter").childNodes);
		const chap = chaps.filter((c) => c.value == this.props.id)[0];
		const chap_idx = chaps.indexOf(chap);
		const chap_nextidx = chap_idx - 1;
		if (chap_nextidx >= 0) {
			return this._jumpChapter(chaps[chap_nextidx].value);
		} else {
			//this.backToManga();
		}
	}

	resizeFunc() {
		this.setState({
			isMobile: this.isMobile()
		});
	};
	componentWillUnmount() {
		Array.from(document.getElementsByTagName("footer")).forEach((f) => {
			f.style.display = "unset";
		});

		window.removeEventListener("resize", () => this.resizeFunc(), false);
	}
	componentDidMount() {
		const { user, setUser } = this.context;

		Array.from(document.getElementsByTagName("footer")).forEach((f) => {
			f.style.display = "none";
		});

		window.addEventListener("resize", () => this.resizeFunc(), false);

		//TODO: Use feed endpoint instead?
		API.chapter({"ids": [this.props.id], "includes": ["manga", "scanlation_group", "user"]}).then((c) => {
			const ch = c.data[0];
			const manga = ch.GetRelationship("manga")[0];
			const user = ch.GetRelationship("user")[0];
			const group = ch.GetRelationship("scanlation_group");

			document.title = `${manga.getTitle()} - ${ch.getTitle()}`;

			//TODO: Sort by oneshot-volume-chapter (see reader/api.js line 241)
			this.setState({
				chapter: c
			});

			API.aggregate(
				manga.getId(), 
				(group != null && group.length > 0) ? {"groups": [group[0].getId()]} : {}
			).then((cs) => {
				var chs = [];

				Object.values(cs.volumes).forEach((v) => {
					var chaps = Object.values(v.chapters);
					//TODO: Gather all then sort to avoid mixed volume-chapter issues

					chaps.sort((a,b) => parseFloat(a.chapter) - parseFloat(b.chapter));

					{chaps.forEach((c) => {
						chs.push(<option value={c.id}>{this.cvTitle(v.volume,c.chapter)}</option>)
					})}
				})

				this.setState({
					chapters: chs
				});
			});
		});
	}

	//Done when changing chapter
	componentDidUpdate(prevProps) {
		if (prevProps.id != this.props.id) {
			this.setState({
				chapter: null,
				chapters: []
			});
			this.componentDidMount();
		}
	}

	render() {
		const { user, setUser } = this.context;
		const chapter = this.hasChapter();

		var mobile_class = this.state.isMobile ? 'layout-vertical' : 'layout-horizontal';

		//TODO: Dont remove fit-vertical and fit-horizontal
		return (
			<Container 
				className={`reader row flex-column no-gutters ${mobile_class} fit-vertical fit-horizontal`} 
				style={{
					/* marginBottom: "-50px", */
					marginTop: "-10px"  //Counteract default margins
				}} 
				data-display="fit-both" 
				data-direction="ltr" 
				data-renderer="single-page"
			>
				{this.readerControls()}
				{chapter != null && 
					<PageRenderer 
						id={chapter.getId()}
						ref={this.changeRender}
						settings={this.changeChild}
						onBegin={() => this.prevChapter(null)}
						onEnd={() => this.nextChapter(null)}
						onRead={() => {user != null && chapter != null && API.readChapter(chapter.getId())}}
					/>
				}
				<SettingsModal ref={this.changeChild} renderer={this.changeRender}/>
			</Container>

		)
	}
}