setcpm(105/4)

$: s("linndrum_bd ~ sd*2 ~").speed(.85).gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: note("f6 d6").sound("piano").lpf(4000).gain(.3)

$: note("c3 eb3 g3 bb3").sound("sawtooth").speed(.9).pan(.6).room(.3).gain(.3)
