setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("hh!4 perc").gain(.18).pan(.53)

$: note("f4 f4@2 ~ d#4 d#4@2 ~ d4 d4@2 ~ c4 c4").s("sawtooth").slow(2).lpf(1400).release(.3).room(.4).gain(.4)

$: note("g1 ~ c2 ~").s("sine").lpf(500).release(.3).gain(.4)

$: n("~ 4 ~ 7").scale("c:minor").s("square").lpf(1600).room(.3).gain(.35)
