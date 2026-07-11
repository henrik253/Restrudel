setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.5)

$: note("e1 ~ e1 ~").s("supersaw").lpf(1761).transpose("<0@7 1 0 1 0 1>/16").release(.2).gain(.45)

$: note("c2 a2 eb2 c2").s("sawtooth").lpf(1208).release(.2).attack(.05).gain(.4)

$: note("~ 6 a#5 g#5 c#4 e4 b4 d#5").s("square").lpf(2187).resonance(6).room(.3).release(.2).gain(.35)
