setcpm(100/4)

$: s("mt mt*2").bank("RolandMT32").room(.1).gain(.8).release(.0971)

$: s("~ cp").gain(.4).release(.3)

$: note("g5 eb5 bb5 d4").scale("c2:minor").sound("drum hat").lpf(2933).lpq(8).delay(.3).slow(4).gain(0.5)
