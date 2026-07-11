setcpm(96/4)
$: s("rd*6 shaker_small:1").gain(.3)
$: n("3 4 0 7 6 4 5 6 4 5 3 4 2 3 1 2").scale("a2:major").s("gm_acoustic_bass").slow(2).gain(.4)
$: note("c4*2 d#4 f4 ~").sound("piano").lpf(700).room(.6).delay(.4).delaytime(".16 | .33").delayfeedback(.4).gain(.35)
