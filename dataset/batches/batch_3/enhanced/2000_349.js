setcpm(120/4);
$: n("10 12 13 9 12").clip(0.5).release(0.25).gain(0.4);
$: note("g4 b4").scale("c2:minor").sound("sine").lpf(4796).room(0.3).gain(0.3);
$: s("bd*4 ~ sd ~").gain(0.8);
