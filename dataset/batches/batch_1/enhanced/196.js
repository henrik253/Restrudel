setcpm(120/4)

$: s("bd:1*2 ~ bd:1 sd ~ bd:1 ~").gain(.8)

$: note("g1 g1 f1 <bb1 d2>").s("sawtooth").lpf(650).resonance(8).release(.15).room(.2).gain(.45)

$: n("<7 ~ 9 ~ 12 ~ 10 ~>").scale("g:minor").s("gm_piccolo").release(.1).gain(.25).delay(.3).pan(.6)

$: s("~ hh ~ hh").gain(.2).pan(.6)
