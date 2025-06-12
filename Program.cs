using System;
using System.Windows.Forms;
using DevExpress.Skins;
using DevExpress.UserSkins;

namespace MyKikiGame
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            BonusSkins.Register();
            SkinManager.EnableFormSkins();

            Application.Run(new MainForm());
        }
    }
} 