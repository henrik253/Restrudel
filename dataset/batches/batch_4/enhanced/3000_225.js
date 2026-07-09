setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: note("e4 f2").sound("supersaw rim").lpf(700).room("<0.5@7 5@5>/16").gain(.2)

$: note("f4 ~ c4 ~ e4 a4 ~ e4 ~ ~ a3 ~ c4 f4 ~ c4").s("rd 1!3").slow(2).lpf(1500).gain(.4)

$: s("~ 3 sd ~ 3").gain(.5)
