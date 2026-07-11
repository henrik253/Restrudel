setcpm(96/4)
$: s("hh bd rim bd").lpf(650).hpf(443).gain(.7)
$: note("g4 ~ ~ b3 ~ d4 g4 ~ d4 ~ ~ c4").s("sawtooth").lpf(1200).gain(.35)
$: n("5 ~ 2 ~ 5 6 ~ 2*3 ~ 5 6 ~ 1*3 ~ 6*3 5 4 5 ~ 2").scale("c:minor").clip(.93).release(.05).s("gm_epiano1").gain(.3)
