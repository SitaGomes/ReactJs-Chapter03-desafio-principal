import Link from "next/link"

import styles from "./header.module.scss"
import common from "../../styles/common.module.scss"

export default function Header() {
  return (
    <Link href="/">
      <header className={`${styles.Header} ${common.Styles}`}>
        <img src="/logo.svg" alt="logo" />
      </header>
    </Link>
  )
}
