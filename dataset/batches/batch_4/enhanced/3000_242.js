setcpm(100)

$: note("a5 c6").sound("supersaw sine").lpf(2579).velocity(0).pan("<.4 .6>/10").room(.7).gain(.4)

$: note("c4 f4").sound("drum ~").lpf(1045).room(.5996).gain(.4).bank("RolandTR909")

$: s("sawtooth square").room(.2).gain(.5)
