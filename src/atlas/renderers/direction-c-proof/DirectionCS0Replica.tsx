import './direction-c-proof.css'

const REFERENCE_URL = '/@fs/D:/.codex/generated_images/01a0c488-10dd-7d22-a0f2-9e63307f8b50/exec-63001ce6-5afb-4ee7-bc9e-c1362f33a091.png'

const stages = ['fabric', 'core', 'business', 'resources', 'capability', 'runtime', 'governance', 'annotations', 'material'] as const
type ProofStage = (typeof stages)[number]
type ProofMode = 'reference' | 'overlay' | 'actual'

function currentMode(): ProofMode {
  const mode = new URLSearchParams(window.location.search).get('proof')
  return mode === 'reference' || mode === 'overlay' ? mode : 'actual'
}

function currentStage(): ProofStage {
  const stage = new URLSearchParams(window.location.search).get('stage')
  return stages.includes(stage as ProofStage) ? stage as ProofStage : 'material'
}

function showThrough(current: ProofStage, target: ProofStage) {
  return stages.indexOf(current) >= stages.indexOf(target)
}

function DirectionCActual({ stage }: { stage: ProofStage }) {
  return (
    <svg className="direction-c-replica" viewBox="0 0 1487 1058" role="img" aria-label="Direction C CRM Agent System Overview replica">
      <defs>
        <linearGradient id="dc-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.58" stopColor="#fbfdff" />
          <stop offset="1" stopColor="#eef5fb" />
        </linearGradient>
        <linearGradient id="dc-white-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f4f8fc" />
          <stop offset="1" stopColor="#e4edf6" />
        </linearGradient>
        <linearGradient id="dc-white-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dce8f3" />
          <stop offset="1" stopColor="#b9c9db" />
        </linearGradient>
        <linearGradient id="dc-white-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d1deeb" />
          <stop offset="1" stopColor="#aabbd0" />
        </linearGradient>
        <linearGradient id="dc-business-field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#f8e4c2" />
        </linearGradient>
        <linearGradient id="dc-resource-field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4fbff" />
          <stop offset="1" stopColor="#dcebf9" />
        </linearGradient>
        <linearGradient id="dc-capability-field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfaff" />
          <stop offset="1" stopColor="#e3def9" />
        </linearGradient>
        <linearGradient id="dc-runtime-field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1fcfa" />
          <stop offset="1" stopColor="#d2f0ec" />
        </linearGradient>
        <linearGradient id="dc-core-left" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7fbff" />
          <stop offset="1" stopColor="#d5eafe" />
        </linearGradient>
        <linearGradient id="dc-core-right" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fc7f8" />
          <stop offset="1" stopColor="#3e90e2" />
        </linearGradient>
        <linearGradient id="dc-governance" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#65b9f4" stopOpacity="0" />
          <stop offset="0.2" stopColor="#65b9f4" stopOpacity="0.12" />
          <stop offset="0.8" stopColor="#65b9f4" stopOpacity="0.12" />
          <stop offset="1" stopColor="#65b9f4" stopOpacity="0" />
        </linearGradient>
        <filter id="dc-contact-shadow" x="-30%" y="-30%" width="160%" height="190%">
          <feDropShadow dx="0" dy="18" stdDeviation="17" floodColor="#365575" floodOpacity="0.16" />
        </filter>
        <filter id="dc-module-shadow" x="-30%" y="-30%" width="170%" height="190%">
          <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#365575" floodOpacity="0.16" />
        </filter>
        <filter id="dc-core-glow" x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#2f80ed" floodOpacity="0.3" />
        </filter>
        <pattern id="dc-ground-grid" width="56" height="30" patternUnits="userSpaceOnUse" patternTransform="skewY(-29)">
          <path d="M56 0H0V30" fill="none" stroke="#99b6d3" strokeOpacity="0.09" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="1487" height="1058" fill="url(#dc-bg)" />
      <path d="M122 618 714 280 1372 610 770 966Z" fill="url(#dc-ground-grid)" opacity="0.5" />

      {showThrough(stage, 'fabric') && (
        <g id="system-fabric" filter={stage === 'material' ? 'url(#dc-contact-shadow)' : undefined}>
          <path className="dc-side-front" d="M488 279 706 391 919 277 919 304 706 421 488 307ZM113 503 375 641 647 493 647 522 375 674 113 532ZM844 495 1106 638 1337 510 1337 540 1106 671 844 525ZM474 731 744 874 1007 727 1007 759 744 909 474 762Z" />
          <path className="dc-side-right" d="M706 391 1001 232 1001 260 919 304 919 277 706 421ZM375 641 647 493 647 522 375 674ZM1106 638 1337 510 1337 540 1106 671ZM744 874 1007 727 1007 759 744 909Z" />

          <path className="dc-fabric-top" d="M486 278 697 122 1000 273 998 294 967 326Q960 335 948 330L909 308 861 337 877 348 856 367 817 344 746 385 674 346 631 370 611 356 632 341 575 309 535 333Q523 340 513 331L487 303Q480 293 486 278Z" />
          <path className="dc-fabric-top" d="M113 492 352 358Q363 351 376 357L647 490 607 514 624 527 605 545 571 527 495 570 512 580 491 601 456 582 397 616Q381 625 366 617L123 493Q110 486 113 492Z" />
          <path className="dc-fabric-top" d="M842 491 1092 359Q1105 352 1118 359L1327 474Q1341 482 1336 497L1314 519Q1306 528 1294 522L1255 501 1206 528 1223 539 1202 556 1164 536 1093 577 1111 589 1090 607 1051 586 983 625Q969 633 956 626L842 564 863 544 846 532 879 513Z" />
          <path className="dc-fabric-top" d="M471 724 534 688 516 675 536 657 571 676 644 634 625 621 646 603 683 623 744 589 806 624 843 604 864 622 845 636 916 675 951 656 972 674 954 688 1000 714Q1013 722 1006 736L991 754Q984 763 973 757L759 879Q746 887 732 879L480 742Q467 735 471 724Z" />

          <path className="dc-neck" d="M632 341 746 385 861 337 848 421 744 480 638 424Z" />
          <path className="dc-neck" d="M571 527 638 424 744 480 683 576 605 545Z" />
          <path className="dc-neck" d="M848 421 956 478 879 513 842 564 744 480Z" />
          <path className="dc-neck" d="M683 576 744 480 843 604 806 624 744 589Z" />

          <path className="dc-field dc-field--business" d="M519 279 703 143 966 274 940 304 905 287 837 328 859 343 817 367 746 327 673 369 632 346 651 333 574 290 540 313Z" />
          <path className="dc-field dc-field--resources" d="M143 491 359 375 611 496 579 514 600 528 571 550 493 591 470 576 487 563 397 612 368 596 387 582 167 476Z" />
          <path className="dc-field dc-field--capability" d="M878 494 1099 378 1302 490 1264 510 1245 499 1178 538 1198 552 1161 573 1090 534 1015 578 981 559 1000 546Z" />
          <path className="dc-field dc-field--runtime" d="M510 722 738 605 967 723 742 851Z" />

          <path className="dc-rim dc-rim--business" d="M506 277 700 135 980 275 956 318 910 294 817 351 746 337 674 377 619 348 642 331 574 295 529 321Z" />
          <path className="dc-rim dc-rim--resources" d="M130 491 357 368 626 495 590 518 610 531 573 559 496 600 473 585 397 628 150 505Z" />
          <path className="dc-rim dc-rim--capability" d="M861 492 1098 368 1320 489 1287 518 1252 498 1170 546 1208 566 1090 628 972 566Z" />
          <path className="dc-rim dc-rim--runtime" d="M492 724 739 596 988 723 744 866Z" />

          <path className="dc-lane dc-lane--business" d="M744 456 744 403 744 365" />
          <path className="dc-lane dc-lane--resources" d="M660 494 587 494 527 456 431 455" />
          <path className="dc-lane dc-lane--capability" d="M828 494 899 494 955 458 1048 458" />
          <path className="dc-lane dc-lane--runtime" d="M744 566 744 621 703 653 703 742" />

          <g className="dc-port-casing">
            <rect x="581" y="482" width="28" height="24" rx="5" />
            <rect x="879" y="482" width="28" height="24" rx="5" />
            <rect x="731" y="575" width="26" height="32" rx="6" />
          </g>
        </g>
      )}

      {showThrough(stage, 'core') && (
        <g id="crm-core" filter={stage === 'material' ? 'url(#dc-core-glow)' : undefined}>
          <ellipse cx="744" cy="514" rx="111" ry="49" fill="none" stroke="#2f80ed" strokeOpacity="0.22" />
          <ellipse cx="744" cy="514" rx="84" ry="36" fill="none" stroke="#2f80ed" strokeOpacity="0.2" strokeDasharray="3 7" />
          <polygon className="dc-core-base-front" points="641,527 744,584 848,527 848,551 744,610 641,552" />
          <polygon className="dc-core-base-top" points="641,527 744,470 848,527 744,584" />
          <polyline className="dc-core-base-rim" points="657,527 744,480 832,527 744,574 657,527" />
          <polygon className="dc-core-left" points="669,417 744,457 744,558 669,518" />
          <polygon className="dc-core-right" points="744,457 819,417 819,518 744,558" />
          <polygon className="dc-core-top" points="669,417 744,376 819,417 744,457" />
          <polygon className="dc-core-band" points="669,498 744,538 819,498 819,518 744,558 669,518" />
          <polygon className="dc-control-left" points="719,390 744,404 744,438 719,424" />
          <polygon className="dc-control-right" points="744,404 769,391 769,425 744,438" />
          <polygon className="dc-control-top" points="719,390 744,376 769,391 744,404" />
          <text className="dc-core-title" x="744" y="474" textAnchor="middle"><tspan x="744">CRM</tspan><tspan x="744" dy="23">Agent</tspan></text>
          <g className="dc-core-ports">
            <circle cx="744" cy="378" r="7" />
            <circle cx="826" cy="494" r="7" />
            <circle cx="744" cy="590" r="7" />
            <circle cx="659" cy="494" r="7" />
          </g>
        </g>
      )}

      {showThrough(stage, 'business') && (
        <g id="business" filter={stage === 'material' ? 'url(#dc-module-shadow)' : undefined}>
          <polygon className="dc-module-top dc-business-stroke" points="699,149 744,123 793,149 746,175" />
          <polygon className="dc-module-left dc-business-stroke" points="699,149 746,175 746,302 699,276" />
          <polygon className="dc-module-right dc-business-stroke" points="746,175 793,149 793,276 746,302" />
          <path className="dc-business-windows" d="M710 170 735 184M710 191 735 205M710 212 735 226M710 233 735 247M710 254 735 268M758 180 782 167M758 201 782 188M758 222 782 209M758 243 782 230" />
          <path className="dc-business-accent" d="M699 149 744 123 793 149" />

          <g><polygon className="dc-module-top" points="624,226 659,207 695,226 660,246" /><polygon className="dc-module-left" points="624,226 660,246 660,289 624,269" /><polygon className="dc-module-right" points="660,246 695,226 695,269 660,289" /></g>
          <g><polygon className="dc-module-top" points="797,220 835,199 873,220 835,241" /><polygon className="dc-module-left" points="797,220 835,241 835,283 797,262" /><polygon className="dc-module-right" points="835,241 873,220 873,262 835,283" /></g>
          <g><polygon className="dc-module-top" points="649,285 683,266 718,285 683,304" /><polygon className="dc-module-left" points="649,285 683,304 683,335 649,316" /><polygon className="dc-module-right" points="683,304 718,285 718,316 683,335" /></g>
          <g><polygon className="dc-module-top" points="846,267 879,249 912,267 879,286" /><polygon className="dc-module-left" points="846,267 879,286 879,318 846,299" /><polygon className="dc-module-right" points="879,286 912,267 912,299 879,318" /></g>
          <g><polygon className="dc-module-top" points="750,301 790,279 840,305 799,329" /><polygon className="dc-module-left" points="750,301 799,329 799,352 750,324" /><polygon className="dc-module-right" points="799,329 840,305 840,328 799,352" /></g>
        </g>
      )}

      {showThrough(stage, 'resources') && (
        <g id="resources" filter={stage === 'material' ? 'url(#dc-module-shadow)' : undefined}>
          <g className="dc-cylinder"><path d="M208 430V520A47 20 0 0 0 302 520V430Z" /><ellipse cx="255" cy="430" rx="47" ry="20" /><path d="M208 486A47 20 0 0 0 302 486" /></g>
          <g className="dc-cylinder dc-cylinder--small"><path d="M300 505V574A43 18 0 0 0 386 574V505Z" /><ellipse cx="343" cy="505" rx="43" ry="18" /><path d="M300 545A43 18 0 0 0 386 545" /></g>
          <g><polygon className="dc-module-top" points="337,396 377,374 417,396 377,418" /><polygon className="dc-module-left" points="337,396 377,418 377,523 337,501" /><polygon className="dc-module-right dc-rack-face" points="377,418 417,396 417,501 377,523" /><path className="dc-rack-lines" d="M386 431 407 419M386 447 407 435M386 463 407 451M386 479 407 467M386 495 407 483" /></g>
          <g><polygon className="dc-module-top" points="430,423 465,404 500,423 465,442" /><polygon className="dc-module-left" points="430,423 465,442 465,520 430,501" /><polygon className="dc-module-right dc-rack-face" points="465,442 500,423 500,501 465,520" /><path className="dc-rack-lines" d="M474 453 492 443M474 468 492 458M474 483 492 473M474 498 492 488" /></g>
          <g><polygon className="dc-module-top" points="472,513 500,498 528,513 500,529" /><polygon className="dc-module-left" points="472,513 500,529 500,568 472,552" /><polygon className="dc-module-right dc-rack-face" points="500,529 528,513 528,552 500,568" /><path className="dc-rack-lines" d="M507 538 521 531M507 548 521 541" /></g>
          <path className="dc-resource-path" d="M204 535 252 560 322 522 385 557 454 519 522 554 575 525" />
        </g>
      )}

      {showThrough(stage, 'capability') && (
        <g id="capability" filter={stage === 'material' ? 'url(#dc-module-shadow)' : undefined}>
          <g><polygon className="dc-module-top" points="1036,429 1095,397 1154,429 1095,462" /><polygon className="dc-module-left" points="1036,429 1095,462 1095,512 1036,479" /><polygon className="dc-module-right dc-capability-face" points="1095,462 1154,429 1154,479 1095,512" /></g>
          <path className="dc-gear" d="M1095 409 1102 413 1110 411 1115 417 1113 425 1118 431 1114 439 1106 440 1101 447 1093 444 1086 447 1080 441 1082 433 1077 427 1081 419 1089 418Z" />
          <circle cx="1097" cy="428" r="7" fill="#fff" />
          <g><polygon className="dc-module-top" points="955,455 986,438 1017,455 986,472" /><polygon className="dc-module-left" points="955,455 986,472 986,512 955,495" /><polygon className="dc-module-right" points="986,472 1017,455 1017,495 986,512" /></g>
          <g><polygon className="dc-module-top" points="1183,463 1216,445 1249,463 1216,481" /><polygon className="dc-module-left" points="1183,463 1216,481 1216,527 1183,509" /><polygon className="dc-module-right" points="1216,481 1249,463 1249,509 1216,527" /></g>
          <g><polygon className="dc-module-top" points="1041,536 1068,521 1095,536 1068,551" /><polygon className="dc-module-left" points="1041,536 1068,551 1068,581 1041,566" /><polygon className="dc-module-right" points="1068,551 1095,536 1095,566 1068,581" /></g>
          <g><polygon className="dc-module-top" points="1110,513 1145,494 1180,513 1145,532" /><polygon className="dc-module-left" points="1110,513 1145,532 1145,579 1110,560" /><polygon className="dc-module-right" points="1145,532 1180,513 1180,560 1145,579" /></g>
          <path className="dc-capability-path" d="M1095 511 1059 531 1014 506M1095 511 1146 539 1198 510M1095 511 1084 547" />
        </g>
      )}

      {showThrough(stage, 'runtime') && (
        <g id="runtime" filter={stage === 'material' ? 'url(#dc-module-shadow)' : undefined}>
          <g><polygon className="dc-module-top" points="636,719 693,688 789,738 731,771" /><polygon className="dc-module-left" points="636,719 731,771 731,817 636,765" /><polygon className="dc-module-right dc-runtime-face" points="731,771 789,738 789,784 731,817" /><path className="dc-runtime-status" d="M747 807 773 793" /><circle className="dc-runtime-indicator" cx="747" cy="787" r="4" /><circle className="dc-runtime-indicator" cx="759" cy="781" r="4" /><circle className="dc-runtime-indicator" cx="771" cy="775" r="4" /></g>
          <g><polygon className="dc-module-top" points="584,696 615,679 647,696 615,714" /><polygon className="dc-module-left" points="584,696 615,714 615,754 584,736" /><polygon className="dc-module-right" points="615,714 647,696 647,736 615,754" /></g>
          <g><polygon className="dc-module-top" points="799,676 827,661 855,676 827,692" /><polygon className="dc-module-left" points="799,676 827,692 827,728 799,712" /><polygon className="dc-module-right" points="827,692 855,676 855,712 827,728" /></g>
          <g><polygon className="dc-module-top" points="758,796 787,780 816,796 787,812" /><polygon className="dc-module-left" points="758,796 787,812 787,843 758,827" /><polygon className="dc-module-right" points="787,812 816,796 816,827 787,843" /></g>
          <g><polygon className="dc-module-top" points="854,758 875,746 896,758 875,770" /><polygon className="dc-module-left" points="854,758 875,770 875,799 854,787" /><polygon className="dc-module-right" points="875,770 896,758 896,787 875,799" /></g>
          <path className="dc-runtime-path" d="M584 759 637 787 683 761 743 792 799 760 856 790" />
          <circle className="dc-state-node" cx="584" cy="759" r="5" /><circle className="dc-state-node" cx="683" cy="761" r="5" /><circle className="dc-state-node" cx="799" cy="760" r="5" /><circle className="dc-state-node" cx="856" cy="790" r="5" />
        </g>
      )}

      {showThrough(stage, 'governance') && (
        <g id="governance">
          <polygon className="dc-governance-plane" points="371,122 440,100 1241,790 1174,833" />
          <path className="dc-governance-spine" d="M414 136 507 235 600 301 744 391 1104 713 1227 812" />
          <circle className="dc-governance-dot" cx="507" cy="235" r="8" /><circle className="dc-governance-dot" cx="600" cy="301" r="8" /><circle className="dc-governance-dot" cx="1104" cy="713" r="8" /><circle className="dc-governance-dot" cx="1227" cy="812" r="6" />
        </g>
      )}

      {showThrough(stage, 'annotations') && (
        <g id="annotations">
          <text className="dc-page-title" x="50" y="64">CRM Agent System Explorer</text>
          <text className="dc-page-subtitle" x="51" y="99">系统总览 / <tspan>System Overview</tspan></text>

          <g className="dc-annotation dc-annotation--business"><path d="M860 205 947 134 1007 134" /><circle cx="860" cy="205" r="7" /><circle cx="1007" cy="134" r="7" /><text x="1031" y="141"><tspan className="zh">业务与产品</tspan><tspan className="en" x="1031" dy="29">Business &amp; Product</tspan></text></g>
          <g className="dc-annotation dc-annotation--resources"><path d="M185 470 66 379 66 327" /><circle cx="185" cy="470" r="7" /><circle cx="66" cy="327" r="7" /><text x="90" y="335"><tspan className="zh">资源与基础设施</tspan><tspan className="en" x="90" dy="29">Resources &amp; Infrastructure</tspan></text></g>
          <g className="dc-annotation dc-annotation--capability"><path d="M1199 431 1270 371 1308 371" /><circle cx="1199" cy="431" r="7" /><circle cx="1308" cy="371" r="7" /><text x="1333" y="379"><tspan className="zh">能力</tspan><tspan className="en" x="1333" dy="29">Capability</tspan></text></g>
          <g className="dc-annotation dc-annotation--runtime"><path d="M578 797 489 887 251 887" /><circle cx="578" cy="797" r="7" /><circle cx="251" cy="887" r="7" /><text x="277" y="895"><tspan className="zh">智能体运行 / 工具链</tspan><tspan className="en" x="277" dy="29">Agent Runtime / Harness</tspan></text></g>
          <g className="dc-annotation dc-annotation--governance"><path d="M1227 812 1264 843 1278 843" /><circle cx="1227" cy="812" r="6" /><text x="1287" y="850"><tspan className="zh">治理与评估</tspan><tspan className="en" x="1287" dy="23">Governance &amp; Evaluation</tspan></text></g>
        </g>
      )}
    </svg>
  )
}

export function DirectionCS0Replica() {
  const mode = currentMode()
  const stage = currentStage()
  const capture = new URLSearchParams(window.location.search).get('capture') === '1'

  return (
    <main className={`direction-c-proof direction-c-proof--${mode}`}>
      <div className="direction-c-proof__canvas">
        {(mode === 'reference' || mode === 'overlay') && (
          <img className="direction-c-proof__reference" src={REFERENCE_URL} alt="Direction C reference" />
        )}
        {(mode === 'actual' || mode === 'overlay') && (
          <div className="direction-c-proof__actual"><DirectionCActual stage={stage} /></div>
        )}
      </div>
      {!capture && (
        <nav className="direction-c-proof__controls" aria-label="Proof display mode">
          <a href={`?proof=reference&stage=${stage}`}>Reference</a>
          <a href={`?proof=overlay&stage=${stage}`}>50% Overlay</a>
          <a href={`?proof=actual&stage=${stage}`}>Actual</a>
          <span>{stage}</span>
        </nav>
      )}
    </main>
  )
}
