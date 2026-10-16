type FabricZoneProps = {
  className: string
  top: string
  front: string
  side: string
  field: string
  rim: string
}

function FabricZone({ className, top, front, side, field, rim }: FabricZoneProps) {
  return (
    <g className={`system-fabric__zone system-fabric__zone--${className}`}>
      <polygon className="system-fabric__face system-fabric__face--front" points={front} />
      <polygon className="system-fabric__face system-fabric__face--side" points={side} />
      <polygon className="system-fabric__face system-fabric__face--top" points={top} />
      <polygon className="system-fabric__field" points={field} />
      <polyline className="system-fabric__rim" points={rim} />
    </g>
  )
}

export function SystemFabricVisual() {
  return (
    <svg className="system-fabric" viewBox="0 0 1400 900" aria-hidden="true">
      <defs>
        <linearGradient id="fabric-top" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.62" stopColor="#f6f9fd" />
          <stop offset="1" stopColor="#eaf1f8" />
        </linearGradient>
        <linearGradient id="fabric-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbe6f1" />
          <stop offset="1" stopColor="#bdccdc" />
        </linearGradient>
        <linearGradient id="fabric-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cfdeec" />
          <stop offset="1" stopColor="#aebed0" />
        </linearGradient>
        <linearGradient id="business-field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#f6dfb9" />
        </linearGradient>
        <linearGradient id="resources-field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1fcf9" />
          <stop offset="1" stopColor="#bfe8df" />
        </linearGradient>
        <linearGradient id="capability-field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#faf8ff" />
          <stop offset="1" stopColor="#d8d0f5" />
        </linearGradient>
        <linearGradient id="runtime-field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f9ff" />
          <stop offset="1" stopColor="#c6def6" />
        </linearGradient>
        <filter id="fabric-contact" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="15" floodColor="#344f70" floodOpacity="0.14" />
        </filter>
      </defs>

      <g className="system-fabric__shadow" filter="url(#fabric-contact)">
        <path d="M454 229 649 121 906 236 805 295 748 405 815 438 1040 324 1302 447 1302 470 1049 610 814 505 760 535 962 658 962 682 712 824 454 690 454 666 613 571 580 536 370 606 70 459 70 436 278 324 594 441 625 404 551 363Z" />
      </g>

      <g className="system-fabric__structure">
        <FabricZone
          className="business"
          top="479,229 674,121 931,236 731,390"
          front="479,229 731,390 731,414 479,253"
          side="731,390 931,236 931,260 731,414"
          field="526,229 675,146 884,239 731,359"
          rim="506,229 675,136 905,239 731,377 506,229"
        />
        <FabricZone
          className="resources"
          top="70,461 278,349 600,474 370,690"
          front="70,461 370,690 370,714 70,485"
          side="370,690 600,474 600,498 370,714"
          field="117,462 282,373 550,477 366,654"
          rim="97,462 280,363 575,477 368,673 97,462"
        />
        <FabricZone
          className="capability"
          top="794,481 1034,356 1302,479 1048,697"
          front="794,481 1048,697 1048,721 794,505"
          side="1048,697 1302,479 1302,503 1048,721"
          field="844,483 1036,383 1250,481 1045,661"
          rim="821,482 1035,370 1278,481 1047,680 821,482"
        />
        <FabricZone
          className="runtime"
          top="454,720 692,590 962,712 712,925"
          front="454,720 712,925 712,949 454,744"
          side="712,925 962,712 962,736 712,949"
          field="505,719 694,616 910,714 709,883"
          rim="481,720 693,603 936,713 711,905 481,720"
        />

        <g className="system-fabric__necks">
          <polygon points="650,355 731,390 760,370 745,430 682,464 620,432" />
          <polygon points="520,443 610,421 682,464 600,505 520,472" />
          <polygon points="745,430 842,443 870,475 790,512 682,464" />
          <polygon points="600,505 682,464 790,512 744,590 680,622 615,582" />
        </g>

        <g className="system-fabric__joint">
          <polygon className="system-fabric__joint-front" points="570,433 682,492 800,429 800,454 682,519 570,459" />
          <polygon className="system-fabric__joint-top" points="570,433 681,374 800,429 682,492" />
          <polyline points="591,433 681,385 779,430 682,482 591,433" />
        </g>

        <g className="system-fabric__lanes">
          <path className="system-fabric__lane system-fabric__lane--business" d="M682 391 684 335 691 280 699 226" />
          <path className="system-fabric__lane system-fabric__lane--resources" d="M590 451 508 451 420 434 322 411" />
          <path className="system-fabric__lane system-fabric__lane--capability" d="M779 449 866 448 964 426 1070 402" />
          <path className="system-fabric__lane system-fabric__lane--runtime" d="M682 492 681 554 693 617 704 693" />
          <path className="system-fabric__conduit" d="M699 226 682 433 322 411 M682 433 1070 402 M682 433 704 693" />
        </g>
      </g>
    </svg>
  )
}
