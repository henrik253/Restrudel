setcpm(115/4)

$: s("bass ~ bd*4 ~").slow(2).gain(.8)

$: s("~ hh ~ hh").gain(.2)

$: note("c3 f3 a3 c4").sound("sawtooth").lpf(900).gain(.4)

$: note("e4 b4 d#5 c#4").sound("sine").gain(.3).room(.3)
