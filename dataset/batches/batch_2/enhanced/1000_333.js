setcpm(116/4)

$: s("bd cr").gain("0.3 0.6 0.5 0.7")

$: s("gm_overdriven_guitar:6 cp sd hh*2").gain(.4).release(1.2).distort("1.5:.7").room(.75).delay(.294)

$: n("7 8").scale("D1:hirajoshi").s("gm_overdriven_guitar:3").delay(.5).gain(.35)
