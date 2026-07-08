setcpm(100/4)
$: n("0 ~ 7 6 4 5 ~ 2 3 ~ 4 3 ~ 4 0 7 6 4").clip(1).s("bd sd").lpf(600).hpf(200).gain(.7)
$: s("hh*8").gain(.2)
$: s("gm_oboe").note("c4 e4").gain(.2).release(.6)
