"use client";

import React, {useEffect, useRef, useState} from "react";

import {AnimatePresence, motion} from "framer-motion";
import {ArrowLeft, ArrowRight, Quote, X} from "lucide-react";

import {cn} from "@/lib/utils";

// ===== Types and Interfaces =====
export interface iTestimonial {
	name: string;
	designation: string;
	description: string;
	profileImage: string;
	icon?: string;
}

interface iCarouselProps {
	items: React.ReactElement<{
		testimonial: iTestimonial;
		index: number;
		layout?: boolean;
		onCardClose: () => void;
	}>[];
	initialScroll?: number;
}

// ===== Custom Hooks =====
const useOutsideClick = (
	ref: React.RefObject<HTMLDivElement | null>,
	onOutsideClick: () => void,
) => {
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (!ref.current || ref.current.contains(event.target as Node)) {
				return;
			}
			onOutsideClick();
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [ref, onOutsideClick]);
};

// ===== Components =====
const Carousel = ({items, initialScroll = 0}: iCarouselProps) => {
	const carouselRef = React.useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = React.useState(false);
	const [canScrollRight, setCanScrollRight] = React.useState(true);

	const checkScrollability = () => {
		if (carouselRef.current) {
			const {scrollLeft, scrollWidth, clientWidth} = carouselRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
		}
	};

	const handleScrollLeft = () => {
		if (carouselRef.current) {
			carouselRef.current.scrollBy({left: -300, behavior: "smooth"});
		}
	};

	const handleScrollRight = () => {
		if (carouselRef.current) {
			carouselRef.current.scrollBy({left: 300, behavior: "smooth"});
		}
	};

	const handleCardClose = (index: number) => {
		if (carouselRef.current) {
			const cardWidth = isMobile() ? 230 : 384;
			const gap = isMobile() ? 4 : 8;
			const scrollPosition = (cardWidth + gap) * (index + 1);
			carouselRef.current.scrollTo({
				left: scrollPosition,
				behavior: "smooth",
			});
		}
	};

	const isMobile = () => {
		return window && window.innerWidth < 768;
	};

	useEffect(() => {
		if (carouselRef.current) {
			carouselRef.current.scrollLeft = initialScroll;
			checkScrollability();
		}
	}, [initialScroll]);

	return (
		<div className="relative w-full mt-10">
			<div
				className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth [scrollbar-width:none] py-5"
				ref={carouselRef}
				onScroll={checkScrollability}
			>
				<div
					className={cn(
						"absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l",
					)}
				/>
				<div
					className={cn(
						"flex flex-row justify-start gap-3 pl-2",
						"max-w-4xl mx-auto",
					)}
				>
					{items.map((item, index) => {
						return (
							<motion.div
								initial={{opacity: 0, y: 20}}
								animate={{
									opacity: 1,
									y: 0,
									transition: {
										duration: 0.5,
										delay: 0.2 * index,
										ease: "easeOut",
										once: true,
									},
								}}
								key={`card-${index}`}
								className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
							>
								{React.cloneElement(item, {
									onCardClose: () => {
										return handleCardClose(index);
									},
								})}
							</motion.div>
						);
					})}
				</div>
			</div>
			<div className="flex justify-end gap-2 mt-4">
				<button
					className="relative z-40 h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center disabled:opacity-50 hover:bg-gray-700 transition-colors duration-200"
					onClick={handleScrollLeft}
					disabled={!canScrollLeft}
				>
					<ArrowLeft className="h-6 w-6 text-white" />
				</button>
				<button
					className="relative z-40 h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center disabled:opacity-50 hover:bg-gray-700 transition-colors duration-200"
					onClick={handleScrollRight}
					disabled={!canScrollRight}
				>
					<ArrowRight className="h-6 w-6 text-white" />
				</button>
			</div>
		</div>
	);
};

const TestimonialCard = ({
	testimonial,
	index,
	layout = false,
	onCardClose = () => {},
	backgroundImage = "https://images.unsplash.com/photo-1686806372726-388d03ff49c8?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
}: {
	testimonial: iTestimonial;
	index: number;
	layout?: boolean;
	onCardClose?: () => void;
	backgroundImage?: string;
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const handleExpand = () => {
		return setIsExpanded(true);
	};
	const handleCollapse = () => {
		setIsExpanded(false);
		onCardClose();
	};

	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				handleCollapse();
			}
		};

		if (isExpanded) {
			const scrollY = window.scrollY;
			document.body.style.position = "fixed";
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = "100%";
			document.body.style.overflow = "hidden";
			document.body.dataset.scrollY = scrollY.toString();
		} else {
			const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.width = "";
			document.body.style.overflow = "";
			window.scrollTo({top: scrollY, behavior: "instant"});
		}

		window.addEventListener("keydown", handleEscapeKey);
		return () => {
			return window.removeEventListener("keydown", handleEscapeKey);
		};
	}, [isExpanded]);

	useOutsideClick(containerRef, handleCollapse);

	return (
		<>
			<AnimatePresence>
				{isExpanded && (
					<div className="fixed inset-0 h-screen overflow-hidden z-50">
						<motion.div
							initial={{opacity: 0}}
							animate={{opacity: 1}}
							exit={{opacity: 0}}
							className="bg-black/50 backdrop-blur-lg h-full w-full fixed inset-0"
						/>
						<motion.div
							initial={{opacity: 0}}
							animate={{opacity: 1}}
							exit={{opacity: 0}}
							ref={containerRef}
							layoutId={layout ? `card-${testimonial.name}` : undefined}
							className="max-w-4xl mx-auto bg-white h-full z-[60] p-4 md:p-8 rounded-2xl relative md:mt-8"
						>
							<button
								className="sticky top-4 h-8 w-8 right-0 ml-auto rounded-full flex items-center justify-center bg-gray-800"
								onClick={handleCollapse}
							>
								<X className="h-6 w-6 text-white absolute" />
							</button>
							<motion.p
								layoutId={layout ? `category-${testimonial.name}` : undefined}
								className="px-0 md:px-16 text-gray-600 text-sm font-medium underline underline-offset-4"
							>
								{testimonial.designation}
							</motion.p>
							<motion.p
								layoutId={layout ? `title-${testimonial.name}` : undefined}
								className="px-0 md:px-16 text-lg md:text-xl font-bold text-gray-900 mt-3"
							>
								{testimonial.name}
							</motion.p>
							<div className="py-4 text-gray-700 px-0 md:px-16 text-base leading-relaxed">
								<Quote className="h-4 w-4 text-gray-400 mb-2" />
								{testimonial.description}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
			<motion.button
				layoutId={layout ? `card-${testimonial.name}` : undefined}
				onClick={handleExpand}
				className=""
				whileHover={{
					rotateX: 2,
					rotateY: 2,
					rotate: 3,
					scale: 1.02,
					transition: {duration: 0.3, ease: "easeOut"},
				}}
			>
					<div
						className={`${index % 2 === 0 ? "rotate-0" : "-rotate-0"} rounded-lg bg-white h-[240px] md:h-[260px] w-56 md:w-60 overflow-hidden flex flex-col items-center justify-center relative z-10 shadow-sm border border-gray-200 cursor-pointer group`}
					>
					<div className="absolute opacity-20" style={{inset: "-1px 0 0"}}>
						<div className="absolute inset-0">
							<img
								className="block w-full h-full object-center object-cover"
								src={backgroundImage}
								alt="Background layer"
								width={384}
								height={550}
							/>
						</div>
					</div>
					<motion.p
						layoutId={layout ? `title-${testimonial.name}` : undefined}
						className="text-gray-900 text-sm font-semibold text-center [text-wrap:balance] mt-4 px-3 leading-relaxed"
					>
						{testimonial.description}
					</motion.p>
					<motion.p
						layoutId={layout ? `category-${testimonial.name}` : undefined}
						className="text-gray-600 text-xs font-medium text-center mt-2"
					>
						{testimonial.name}
					</motion.p>
					{/* Click to read more indicator */}
					<div className="mt-3 flex items-center justify-center text-xs text-gray-400 group-hover:text-gray-500 transition-colors">
						<span>Click to read more</span>
						<svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			</motion.button>
		</>
	);
};

const IconElement = ({icon}: {icon?: string}) => {
	// Dopaya brand icons - using elements that could be from your logo
	const getIconContent = (iconType?: string) => {
		switch (iconType) {
			case "community":
				return (
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
					</svg>
				);
			case "dedication":
				return (
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
					</svg>
				);
			case "process":
				return (
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
					</svg>
				);
			case "exchange":
				return (
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
						<polyline points="7,10 12,15 17,10"/>
						<line x1="12" y1="15" x2="12" y2="3"/>
					</svg>
				);
			case "ecosystem":
				return (
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<circle cx="12" cy="12" r="3"/>
						<path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
					</svg>
				);
			case "founder":
				return (
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
						<circle cx="12" cy="7" r="4"/>
					</svg>
				);
			default:
				return (
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<circle cx="12" cy="12" r="10"/>
						<path d="M12 6v6l4 2"/>
					</svg>
				);
		}
	};

	return (
		<div className="w-[32px] h-[32px] md:w-[36px] md:h-[36px] bg-orange-100 rounded-full flex items-center justify-center border border-orange-200">
			<div className="text-orange-600">
				{getIconContent(icon)}
			</div>
		</div>
	);
};

const ProfileImage = ({src, alt, ...rest}: {src: string; alt: string; [key: string]: any}) => {
	const [isLoading, setLoading] = useState(true);

	return (
		<div className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] opacity-70 overflow-hidden rounded-[1000px] border-[1px] border-solid border-gray-300 aspect-[1/1] flex-none relative">
			<img
				className={cn(
					"transition duration-300 absolute top-0 inset-0 rounded-inherit object-cover z-50",
					isLoading ? "blur-sm" : "blur-0",
				)}
				onLoad={() => {
					return setLoading(false);
				}}
				src={src}
				width={70}
				height={70}
				loading="lazy"
				decoding="async"
				alt={alt || "Profile image"}
				{...rest}
			/>
		</div>
	);
};

// Export the components
export {Carousel, TestimonialCard, ProfileImage};
