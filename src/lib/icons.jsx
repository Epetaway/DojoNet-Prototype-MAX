// FontAwesome Icons - Centralized icon library (JSX)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse,
  faCalendar,
  faMessage,
  faUsers,
  faBook,
  faGear,
  faPlus,
  faBell,
  faRightFromBracket,
  faHeart,
  faComment,
  faShareNodes,
  faBookmark,
  faThumbsUp,
  faThumbsDown,
  faLock,
  faGlobe,
  faUserGroup,
  faImage,
  faVideo,
  faXmark,
  faFileLines,
  faClock,
  faTrash,
  faMapPin,
  faBolt,
  faCircleCheck,
  faFilter,
  faUpload,
  faFloppyDisk,
  faCheck,
  faSun,
  faMoon,
  faPlay,
  faPause,
  faMusic,
  faWandMagicSparkles,
  faCircleUser,
  faEllipsisVertical,
  faArrowRight,
  faChevronRight,
  faMagnifyingGlass,
  faCirclePlus,
  faPaperPlane,
  faEye,
  faBullseye,
  faTrophy,
  faMedal,
  faFire,
  faChartLine,
  faDumbbell,
  faPersonRunning,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons'

import {
  faHeart as faHeartRegular,
  faBookmark as faBookmarkRegular,
  faComment as faCommentRegular,
  faCircleUser as faCircleUserRegular,
} from '@fortawesome/free-regular-svg-icons'

// Icon component wrapper for consistent usage
export const Icon = ({ icon, className = '', ...props }) => (
  <FontAwesomeIcon icon={icon} className={className} {...props} />
)

// Export commonly used icons
export const icons = {
  // Navigation
  home: faHouse,
  calendar: faCalendar,
  message: faMessage,
  users: faUsers,
  book: faBook,
  settings: faGear,
  bell: faBell,
  logout: faRightFromBracket,

  // Actions
  plus: faPlus,
  search: faMagnifyingGlass,
  filter: faFilter,
  upload: faUpload,
  save: faFloppyDisk,
  check: faCheck,
  close: faXmark,
  trash: faTrash,
  send: faPaperPlane,
  eye: faEye,

  // Social
  heart: faHeart,
  heartOutline: faHeartRegular,
  comment: faComment,
  commentOutline: faCommentRegular,
  share: faShareNodes,
  bookmark: faBookmark,
  bookmarkOutline: faBookmarkRegular,
  thumbsUp: faThumbsUp,
  thumbsDown: faThumbsDown,

  // Visibility
  lock: faLock,
  globe: faGlobe,
  userGroup: faUserGroup,

  // Media
  image: faImage,
  video: faVideo,
  play: faPlay,
  pause: faPause,
  music: faMusic,
  volumeHigh: faVolumeHigh,
  volumeLow: faVolumeLow,
  volumeMute: faVolumeXmark,

  // Content
  file: faFileLines,
  clock: faClock,
  mapPin: faMapPin,
  location: faMapPin,
  bolt: faBolt,
  checkCircle: faCircleCheck,
  sparkles: faWandMagicSparkles,

  // User
  user: faCircleUser,
  userOutline: faCircleUserRegular,
  dots: faEllipsisVertical,

  // Theme
  sun: faSun,
  moon: faMoon,

  // Misc
  arrowRight: faArrowRight,
  chevronRight: faChevronRight,
  circlePlus: faCirclePlus,
  target: faBullseye,
  trophy: faTrophy,
  medal: faMedal,
  fire: faFire,
  chart: faChartLine,
  dumbbell: faDumbbell,
  running: faPersonRunning,
}

export default Icon
