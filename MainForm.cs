using System;
using System.Drawing;
using System.Windows.Forms;
using DevExpress.XtraEditors;

namespace MyKikiGame
{
    public partial class MainForm : XtraForm
    {
        private bool isDragging = false;
        private Point dragStartPoint;
        private Point kikiStartPoint;
        private PictureBox kikiPictureBox;

        public MainForm()
        {
            InitializeComponent();
            InitializeKiki();
        }

        private void InitializeKiki()
        {
            kikiPictureBox = new PictureBox
            {
                Size = new Size(100, 100),
                Location = new Point(100, 100),
                Image = Properties.Resources.kiki, // Kiki 이미지 리소스 필요
                SizeMode = PictureBoxSizeMode.StretchImage
            };

            // 마우스 이벤트 핸들러 등록
            kikiPictureBox.MouseDown += KikiPictureBox_MouseDown;
            kikiPictureBox.MouseMove += KikiPictureBox_MouseMove;
            kikiPictureBox.MouseUp += KikiPictureBox_MouseUp;

            this.Controls.Add(kikiPictureBox);
        }

        private void KikiPictureBox_MouseDown(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                isDragging = true;
                dragStartPoint = e.Location;
                kikiStartPoint = kikiPictureBox.Location;
            }
        }

        private void KikiPictureBox_MouseMove(object sender, MouseEventArgs e)
        {
            if (isDragging)
            {
                int deltaX = e.X - dragStartPoint.X;
                int deltaY = e.Y - dragStartPoint.Y;

                // 새로운 위치 계산
                int newX = kikiStartPoint.X + deltaX;
                int newY = kikiStartPoint.Y + deltaY;

                // 폼 경계 체크
                newX = Math.Max(0, Math.Min(newX, this.ClientSize.Width - kikiPictureBox.Width));
                newY = Math.Max(0, Math.Min(newY, this.ClientSize.Height - kikiPictureBox.Height));

                kikiPictureBox.Location = new Point(newX, newY);
            }
        }

        private void KikiPictureBox_MouseUp(object sender, MouseEventArgs e)
        {
            isDragging = false;
        }

        private void InitializeComponent()
        {
            this.SuspendLayout();
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 14F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 600);
            this.Name = "MainForm";
            this.Text = "My Kiki Game";
            this.ResumeLayout(false);
        }
    }
} 