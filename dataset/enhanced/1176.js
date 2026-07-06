setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("rd*3 ~").gain(.22).pan(.6)

$: note("a4 d#5@2 ~ a4 c5 b4 a4 ~").s("sawtooth").lpf(3000).release(.2).room(.4).gain(.4)

$: note("<a1 e2 c2 d2>").s("square").lpf(650).release(.3).gain(.5)
