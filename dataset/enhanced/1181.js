setcpm(118/4)

$: s("bd ~ sd ~").bank("tr909").gain(.85)

$: s("~ woodblock ~ woodblock").gain(.3).pan(.5)

$: note("~ a4 d#5@2 ~ a4 d#5@3 ~ a4").s("sawtooth").gain("0.35 0.4 0.35 0.4").lpf(2800).release(.2).room(.4).delay(.3)

$: note("<a1 e2 c2 d2>").s("square").lpf(650).release(.3).gain(.5)
